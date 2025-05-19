"use server"

import { createServerClient } from "./supabase"

// Update user coins
export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  try {
    const supabase = createServerClient()

    // Get current coins
    const { data: userData, error: fetchError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (fetchError) throw fetchError

    const newCoins = userData.coins + amount

    // Update coins
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: newCoins, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (updateError) throw updateError

    // Log transaction
    await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount,
        type: transactionType,
        description: description || transactionType,
        created_at: new Date().toISOString(),
      },
    ])

    return { success: true, newCoins }
  } catch (error) {
    console.error("Error updating coins:", error)
    return { success: false, error }
  }
}

// Update user energy
export async function updateUserEnergy(userId: string, amount: number) {
  try {
    const supabase = createServerClient()

    // Get current energy and max energy
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    // Calculate new energy (ensure it doesn't go below 0 or above max)
    const newEnergy = Math.max(0, Math.min(userData.max_energy, userData.energy + amount))

    // Update energy
    const { error: updateError } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
        last_energy_regen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) throw updateError

    return { success: true, newEnergy }
  } catch (error) {
    console.error("Error updating energy:", error)
    return { success: false, error }
  }
}

// Upgrade boost
export async function upgradeBoost(userId: string, boostType: string) {
  try {
    const supabase = createServerClient()

    // Get user data
    const { data: userData, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) throw userError

    // Get boost data
    const { data: boostData, error: boostError } = await supabase
      .from("user_boosts")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (boostError) throw boostError

    // Determine which boost to upgrade and calculate cost
    let boostField = ""
    let currentLevel = 1
    let cost = 0

    if (boostType === "multiTouch") {
      boostField = "multi_touch_level"
      currentLevel = boostData.multi_touch_level
      cost = 2000 * Math.pow(1.5, currentLevel - 1)
    } else if (boostType === "energyLimit") {
      boostField = "energy_limit_level"
      currentLevel = boostData.energy_limit_level
      cost = 2000 * Math.pow(1.5, currentLevel - 1)
    } else if (boostType === "chargeSpeed") {
      boostField = "charge_speed_level"
      currentLevel = boostData.charge_speed_level
      cost = 2000 * Math.pow(1.5, currentLevel - 1)
    } else {
      return { success: false, message: "Invalid boost type" }
    }

    // Check if user has enough coins
    if (userData.coins < cost) {
      return { success: false, message: "Not enough coins" }
    }

    // Update boost level
    const newLevel = currentLevel + 1
    const { error: updateBoostError } = await supabase
      .from("user_boosts")
      .update({ [boostField]: newLevel })
      .eq("user_id", userId)

    if (updateBoostError) throw updateBoostError

    // Update user coins
    const { error: updateCoinsError } = await supabase
      .from("users")
      .update({
        coins: userData.coins - cost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateCoinsError) throw updateCoinsError

    // Log transaction
    await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount: -cost,
        type: "boost_upgrade",
        description: `Upgraded ${boostType} to level ${newLevel}`,
        created_at: new Date().toISOString(),
      },
    ])

    return {
      success: true,
      newLevel,
      cost: 2000 * Math.pow(1.5, newLevel - 1), // Cost for next upgrade
    }
  } catch (error) {
    console.error("Error upgrading boost:", error)
    return { success: false, error }
  }
}

// Use rocket boost
export async function useRocketBoost(userId: string) {
  try {
    const supabase = createServerClient()

    // Get user boosts
    const { data: boostData, error: boostError } = await supabase
      .from("user_boosts")
      .select("daily_rockets")
      .eq("user_id", userId)
      .single()

    if (boostError) throw boostError

    // Check if user has rockets left
    if (boostData.daily_rockets <= 0) {
      return { success: false, message: "No rockets left today" }
    }

    // Update rockets count
    const { error: updateError } = await supabase
      .from("user_boosts")
      .update({
        daily_rockets: boostData.daily_rockets - 1,
      })
      .eq("user_id", userId)

    if (updateError) throw updateError

    // Add energy to user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    const newEnergy = Math.min(userData.max_energy, userData.energy + 500)

    const { error: energyError } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (energyError) throw energyError

    return {
      success: true,
      rocketsLeft: boostData.daily_rockets - 1,
      energyAdded: newEnergy - userData.energy,
    }
  } catch (error) {
    console.error("Error using rocket boost:", error)
    return { success: false, error }
  }
}

// Use full energy boost
export async function useFullEnergyBoost(userId: string) {
  try {
    const supabase = createServerClient()

    // Get user boosts
    const { data: boostData, error: boostError } = await supabase
      .from("user_boosts")
      .select("energy_full_used")
      .eq("user_id", userId)
      .single()

    if (boostError) throw boostError

    // Check if boost already used today
    if (boostData.energy_full_used) {
      return { success: false, message: "Full energy boost already used today" }
    }

    // Update boost usage
    const { error: updateError } = await supabase
      .from("user_boosts")
      .update({ energy_full_used: true })
      .eq("user_id", userId)

    if (updateError) throw updateError

    // Set user energy to max
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("max_energy")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    const { error: energyError } = await supabase
      .from("users")
      .update({
        energy: userData.max_energy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (energyError) throw energyError

    return { success: true }
  } catch (error) {
    console.error("Error using full energy boost:", error)
    return { success: false, error }
  }
}

// Collect hourly earnings
export async function collectHourlyEarnings(userId: string) {
  try {
    const supabase = createServerClient()

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("coins, hourly_earn, last_hourly_collect")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    // Check if an hour has passed since last collection
    const lastCollect = new Date(userData.last_hourly_collect)
    const now = new Date()
    const hoursPassed = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)

    if (hoursPassed < 1) {
      const minutesLeft = Math.ceil(60 - hoursPassed * 60)
      return {
        success: false,
        message: `You can collect again in ${minutesLeft} minutes`,
      }
    }

    // Update user coins and last collection time
    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: userData.coins + userData.hourly_earn,
        last_hourly_collect: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", userId)

    if (updateError) throw updateError

    // Log transaction
    await supabase.from("coin_transactions").insert([
      {
        user_id: userId,
        amount: userData.hourly_earn,
        type: "hourly_collect",
        description: "Collected hourly earnings",
        created_at: now.toISOString(),
      },
    ])

    return {
      success: true,
      coins: userData.hourly_earn,
    }
  } catch (error) {
    console.error("Error collecting hourly earnings:", error)
    return { success: false, error }
  }
}

// Get user daily combo
export async function getUserDailyCombo(userId: string) {
  try {
    const supabase = createServerClient()

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Check if user has a combo for today
    const { data: comboData, error: comboError } = await supabase
      .from("daily_combos")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    if (comboError) {
      // If no combo exists for today, create one
      if (comboError.code === "PGRST116") {
        // Generate random card IDs (1-10)
        const cardIds = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10) + 1)

        // Calculate reward based on user's league
        const { data: userData } = await supabase.from("users").select("league").eq("id", userId).single()

        const baseReward = 100000
        const leagueMultiplier = userData?.league || 1
        const reward = baseReward * leagueMultiplier

        // Create new combo
        const { data: newCombo, error: createError } = await supabase
          .from("daily_combos")
          .insert([
            {
              user_id: userId,
              date: today,
              card_ids: cardIds,
              found_card_ids: [],
              reward,
              is_completed: false,
            },
          ])
          .select()
          .single()

        if (createError) throw createError

        return newCombo
      } else {
        throw comboError
      }
    }

    return comboData
  } catch (error) {
    console.error("Error getting daily combo:", error)
    return null
  }
}

// Find daily combo card
export async function findDailyComboCard(userId: string, cardIndex: number) {
  try {
    const supabase = createServerClient()

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Get user's daily combo
    const { data: comboData, error: comboError } = await supabase
      .from("daily_combos")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    if (comboError) throw comboError

    // Check if combo is already completed
    if (comboData.is_completed) {
      return {
        success: false,
        message: "Daily combo already completed",
      }
    }

    // Check if card index is valid
    if (cardIndex < 0 || cardIndex >= comboData.card_ids.length) {
      return {
        success: false,
        message: "Invalid card index",
      }
    }

    // Check if card is already found
    if (comboData.found_card_ids.includes(comboData.card_ids[cardIndex])) {
      return {
        success: false,
        message: "Card already found",
      }
    }

    // Add card to found cards
    const foundCardIds = [...comboData.found_card_ids, comboData.card_ids[cardIndex]]

    // Check if all cards are found
    const isCompleted = foundCardIds.length === comboData.card_ids.length

    // Update combo
    const { error: updateError } = await supabase
      .from("daily_combos")
      .update({
        found_card_ids: foundCardIds,
        is_completed: isCompleted,
      })
      .eq("id", comboData.id)

    if (updateError) throw updateError

    // If combo is completed, add reward to user
    if (isCompleted) {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("coins")
        .eq("id", userId)
        .single()

      if (userError) throw userError

      // Update user coins
      const { error: updateCoinsError } = await supabase
        .from("users")
        .update({
          coins: userData.coins + comboData.reward,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateCoinsError) throw updateCoinsError

      // Log transaction
      await supabase.from("coin_transactions").insert([
        {
          user_id: userId,
          amount: comboData.reward,
          type: "daily_combo",
          description: "Completed daily combo",
          created_at: new Date().toISOString(),
        },
      ])
    }

    return {
      success: true,
      cardId: comboData.card_ids[cardIndex],
      foundCardIds,
      isCompleted,
      reward: isCompleted ? comboData.reward : 0,
    }
  } catch (error) {
    console.error("Error finding combo card:", error)
    return { success: false, error }
  }
}
