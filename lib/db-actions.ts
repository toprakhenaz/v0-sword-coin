"use server"

import { createServerClient } from "./supabase"

// Update user coins
export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  try {
    const supabase = createServerClient()

    // Get current coins
    const { data: userData, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, message: "Failed to fetch user data" }
    }

    const newCoins = userData.coins + amount

    // Update coins
    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating coins:", updateError)
      return { success: false, message: "Failed to update coins" }
    }

    // Record transaction
    const { error: transactionError } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: amount,
        type: transactionType,
        description: description || null,
      },
    ])

    if (transactionError) {
      console.error("Error recording transaction:", transactionError)
      // Don't fail the whole operation if just the transaction recording fails
    }

    return { success: true, newCoins }
  } catch (error) {
    console.error("Error in updateUserCoins:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Update user energy
export async function updateUserEnergy(userId: string, amount: number) {
  try {
    const supabase = createServerClient()

    // Get current energy and max energy
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, message: "Failed to fetch user data" }
    }

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

    if (updateError) {
      console.error("Error updating energy:", updateError)
      return { success: false, message: "Failed to update energy" }
    }

    return { success: true, newEnergy }
  } catch (error) {
    console.error("Error in updateUserEnergy:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Upgrade boost
export async function upgradeBoost(userId: string, boostType: string) {
  try {
    const supabase = createServerClient()

    // Get user data and boosts
    const [userResult, boostResult] = await Promise.all([
      supabase.from("users").select("coins").eq("id", userId).single(),
      supabase.from("user_boosts").select("*").eq("user_id", userId).single(),
    ])

    if (userResult.error) {
      console.error("Error fetching user data:", userResult.error)
      return { success: false, message: "Failed to fetch user data" }
    }

    if (boostResult.error) {
      console.error("Error fetching user boosts:", boostResult.error)
      return { success: false, message: "Failed to fetch user boosts" }
    }

    const userData = userResult.data
    const boostData = boostResult.data

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
    const updateData: Record<string, any> = {
      [boostField]: newLevel,
      updated_at: new Date().toISOString(),
    }

    const { error: boostUpdateError } = await supabase.from("user_boosts").update(updateData).eq("user_id", userId)

    if (boostUpdateError) {
      console.error("Error updating boost:", boostUpdateError)
      return { success: false, message: "Failed to upgrade boost" }
    }

    // Update user coins
    const { error: coinUpdateError } = await supabase
      .from("users")
      .update({
        coins: userData.coins - cost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (coinUpdateError) {
      console.error("Error updating coins:", coinUpdateError)
      return { success: false, message: "Failed to update coins" }
    }

    // Update user stats based on boost type
    if (boostType === "multiTouch") {
      const newEarnPerTap = 1 + (newLevel - 1) * 2
      await supabase
        .from("users")
        .update({
          earn_per_tap: newEarnPerTap,
        })
        .eq("id", userId)
    } else if (boostType === "energyLimit") {
      const newMaxEnergy = 100 + (newLevel - 1) * 500
      await supabase
        .from("users")
        .update({
          max_energy: newMaxEnergy,
        })
        .eq("id", userId)
    }

    // Record transaction
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: -cost,
        type: "boost_upgrade",
        description: `Upgraded ${boostType} to level ${newLevel}`,
      },
    ])

    return {
      success: true,
      newLevel,
      cost: 2000 * Math.pow(1.5, newLevel - 1),
    }
  } catch (error) {
    console.error("Error in upgradeBoost:", error)
    return { success: false, message: "An unexpected error occurred" }
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

    if (boostError) {
      console.error("Error fetching user boosts:", boostError)
      return { success: false, message: "Failed to fetch user boosts" }
    }

    // Check if user has rockets left
    if (boostData.daily_rockets <= 0) {
      return { success: false, message: "No rockets left for today" }
    }

    // Update rockets count
    const { error: updateError } = await supabase
      .from("user_boosts")
      .update({
        daily_rockets: boostData.daily_rockets - 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating rockets:", updateError)
      return { success: false, message: "Failed to use rocket" }
    }

    // Add energy
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, message: "Failed to fetch user data" }
    }

    const newEnergy = Math.min(userData.max_energy, userData.energy + 500)

    const { error: energyUpdateError } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (energyUpdateError) {
      console.error("Error updating energy:", energyUpdateError)
      return { success: false, message: "Failed to update energy" }
    }

    return {
      success: true,
      rocketsLeft: boostData.daily_rockets - 1,
      energyAdded: 500,
    }
  } catch (error) {
    console.error("Error in useRocketBoost:", error)
    return { success: false, message: "An unexpected error occurred" }
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

    if (boostError) {
      console.error("Error fetching user boosts:", boostError)
      return { success: false, message: "Failed to fetch user boosts" }
    }

    // Check if boost already used
    if (boostData.energy_full_used) {
      return { success: false, message: "Full energy boost already used today" }
    }

    // Update boost usage
    const { error: updateError } = await supabase
      .from("user_boosts")
      .update({
        energy_full_used: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating energy full used:", updateError)
      return { success: false, message: "Failed to use energy boost" }
    }

    // Set energy to max
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("max_energy")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, message: "Failed to fetch user data" }
    }

    const { error: energyUpdateError } = await supabase
      .from("users")
      .update({
        energy: userData.max_energy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (energyUpdateError) {
      console.error("Error updating energy:", energyUpdateError)
      return { success: false, message: "Failed to update energy" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in useFullEnergyBoost:", error)
    return { success: false, message: "An unexpected error occurred" }
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

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, message: "Failed to fetch user data" }
    }

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

    // Calculate coins to add (hourly_earn * whole hours passed, max 24 hours)
    const hoursToCount = Math.min(Math.floor(hoursPassed), 24)
    const coinsToAdd = userData.hourly_earn * hoursToCount

    // Update user coins and last collect time
    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: userData.coins + coinsToAdd,
        last_hourly_collect: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating coins:", updateError)
      return { success: false, message: "Failed to collect earnings" }
    }

    // Record transaction
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: coinsToAdd,
        type: "hourly_collect",
        description: `Collected ${hoursToCount} hours of earnings`,
      },
    ])

    return {
      success: true,
      coins: coinsToAdd,
      hours: hoursToCount,
    }
  } catch (error) {
    console.error("Error in collectHourlyEarnings:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Get user daily combo
export async function getUserDailyCombo(userId: string) {
  try {
    const supabase = createServerClient()

    // Check if user has a daily combo for today
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("daily_combos")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error, which is expected if no combo exists
      console.error("Error fetching daily combo:", error)
      return null
    }

    // If combo exists for today, return it
    if (data) {
      return data
    }

    // Otherwise, create a new daily combo
    const cardIds = generateRandomCardIds(3) // Generate 3 random card IDs
    const reward = 100000 // Set reward amount

    const { data: newCombo, error: insertError } = await supabase
      .from("daily_combos")
      .insert([
        {
          user_id: userId,
          card_ids: cardIds,
          found_card_ids: [],
          reward: reward,
          is_completed: false,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Error creating daily combo:", insertError)
      return null
    }

    return newCombo
  } catch (error) {
    console.error("Error in getUserDailyCombo:", error)
    return null
  }
}

// Find daily combo card
export async function findDailyComboCard(userId: string, cardIndex: number) {
  try {
    const supabase = createServerClient()

    // Get user's daily combo
    const dailyCombo = await getUserDailyCombo(userId)

    if (!dailyCombo) {
      return { success: false, message: "Daily combo not found" }
    }

    // Check if combo is already completed
    if (dailyCombo.is_completed) {
      return { success: false, message: "Daily combo already completed" }
    }

    // Check if card index is valid
    if (cardIndex < 0 || cardIndex >= dailyCombo.card_ids.length) {
      return { success: false, message: "Invalid card index" }
    }

    // Get the card ID at the specified index
    const cardId = dailyCombo.card_ids[cardIndex]

    // Check if card is already found
    if (dailyCombo.found_card_ids.includes(cardId)) {
      return { success: false, message: "Card already found" }
    }

    // Add card to found cards
    const foundCardIds = [...dailyCombo.found_card_ids, cardId]
    const isCompleted = foundCardIds.length === dailyCombo.card_ids.length

    // Update daily combo
    const { error: updateError } = await supabase
      .from("daily_combos")
      .update({
        found_card_ids: foundCardIds,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dailyCombo.id)

    if (updateError) {
      console.error("Error updating daily combo:", updateError)
      return { success: false, message: "Failed to update daily combo" }
    }

    // If combo is completed, add reward to user
    if (isCompleted) {
      const { error: coinUpdateError } = await supabase.rpc("add_user_coins", {
        user_id_param: userId,
        amount_param: dailyCombo.reward,
      })

      if (coinUpdateError) {
        console.error("Error adding reward:", coinUpdateError)
        return {
          success: true,
          cardId,
          foundCardIds,
          isCompleted,
          message: "Card found but failed to add reward",
        }
      }

      // Record transaction
      await supabase.from("transactions").insert([
        {
          user_id: userId,
          amount: dailyCombo.reward,
          type: "daily_combo",
          description: "Completed daily combo",
        },
      ])

      return {
        success: true,
        cardId,
        foundCardIds,
        isCompleted,
        reward: dailyCombo.reward,
      }
    }

    return {
      success: true,
      cardId,
      foundCardIds,
      isCompleted,
    }
  } catch (error) {
    console.error("Error in findDailyComboCard:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Helper function to generate random card IDs
function generateRandomCardIds(count: number): number[] {
  const cardIds: number[] = []
  for (let i = 0; i < count; i++) {
    // Generate random card ID between 1 and 10
    cardIds.push(Math.floor(Math.random() * 10) + 1)
  }
  return cardIds
}
