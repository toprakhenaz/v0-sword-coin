"use server"

import { createServerClient } from "./supabase"

// User related actions
export async function getUserByTelegramId(telegramId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function createUser(telegramId: string, username: string) {
  const supabase = createServerClient()

  // Create user with default values
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        telegram_id: telegramId,
        username,
        coins: 1000,
        league: 1,
        hourly_earn: 10,
        earn_per_tap: 1,
        energy: 100,
        max_energy: 100,
        last_energy_regen: new Date().toISOString(),
        last_hourly_collect: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  // Create initial boosts for the user
  await supabase.from("user_boosts").insert([
    {
      user_id: data.id,
      multi_touch_level: 1,
      energy_limit_level: 1,
      charge_speed_level: 1,
      daily_rockets: 3,
      max_daily_rockets: 3,
      energy_full_used: false,
    },
  ])

  // Create initial daily combo
  await createDailyCombo(data.id)

  return data
}

export async function getOrCreateUser(telegramId: string, username: string) {
  let user = await getUserByTelegramId(telegramId)

  if (!user) {
    user = await createUser(telegramId, username)
  }

  return user
}

// Add this function to handle rate limiting errors
export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  const supabase = createServerClient()
  try {
    // First, update the user's coins
    const { data: userData, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return null
    }

    const newCoins = Math.max(0, userData.coins + amount) // Prevent negative coins

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      // Check if this is a rate limit error
      if (updateError.message && updateError.message.includes("Too Many Requests")) {
        console.warn("Rate limit hit when updating coins. Using local value.")
        return null // Return null to indicate rate limiting
      }

      console.error("Error updating user coins:", updateError)
      return null
    }

    // Then, log the transaction (but don't fail if this part fails)
    try {
      await supabase.from("coin_transactions").insert([
        {
          user_id: userId,
          amount,
          transaction_type: transactionType,
          description: description || transactionType,
        },
      ])
    } catch (transactionError) {
      // Just log the error but don't fail the whole operation
      console.error("Error logging coin transaction:", transactionError)
    }

    return newCoins
  } catch (error) {
    // Handle JSON parsing errors that occur with rate limiting
    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.warn("Rate limit hit when updating coins (JSON parse error). Using local value.")
      return null // Return null to indicate rate limiting
    }

    console.error("Error in updateUserCoins:", error)
    throw error
  }
}

// Item related actions
export async function getUserItems(userId: string) {
  const supabase = createServerClient()
  try {
    const { data, error } = await supabase
      .from("user_items")
      .select(`
        *,
        items (*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user items:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in getUserItems:", error)
    return []
  }
}

// Calculate and update user's total hourly earn
export async function updateUserHourlyEarn(userId: string) {
  const supabase = createServerClient()

  try {
    // Get all user items
    const { data: userItems, error: itemsError } = await supabase
      .from("user_items")
      .select("hourly_income")
      .eq("user_id", userId)

    if (itemsError) {
      console.error("Error fetching user items:", itemsError)
      return 0
    }

    // Calculate total hourly earn
    const totalHourlyEarn = userItems.reduce((total, item) => total + item.hourly_income, 0)

    // Update user
    const { error: updateError } = await supabase
      .from("users")
      .update({ hourly_earn: totalHourlyEarn, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating hourly earn:", updateError)
    }

    return totalHourlyEarn
  } catch (error) {
    console.error("Error in updateUserHourlyEarn:", error)
    return 0
  }
}

export async function upgradeItem(userId: string, itemId: number) {
  const supabase = createServerClient()

  try {
    // Get user and item details
    const { data: userItem, error: itemError } = await supabase
      .from("user_items")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .single()

    // If user doesn't have this item yet, create it
    if (itemError) {
      // Get base item details
      const { data: baseItem, error: baseItemError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single()

      if (baseItemError) {
        console.error("Error fetching base item:", baseItemError)
        return { success: false, message: "Item not found" }
      }

      // Get user coins
      const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

      if (userError) {
        console.error("Error fetching user:", userError)
        return { success: false, message: "User not found" }
      }

      // Check if user has enough coins
      if (user.coins < baseItem.base_upgrade_cost) {
        return { success: false, message: "Not enough coins" }
      }

      // Create user item
      const { data: newUserItem, error: createError } = await supabase
        .from("user_items")
        .insert([
          {
            user_id: userId,
            item_id: itemId,
            level: 1,
            hourly_income: baseItem.base_hourly_income,
            upgrade_cost: baseItem.base_upgrade_cost,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating user item:", createError)
        return { success: false, message: "Error creating item" }
      }

      // Deduct coins from user
      await updateUserCoins(userId, -baseItem.base_upgrade_cost, "item_purchase", `Purchased item ${itemId}`)

      // Update user hourly earn
      const newHourlyEarn = await updateUserHourlyEarn(userId)

      return {
        success: true,
        level: 1,
        hourlyIncome: baseItem.base_hourly_income,
        upgradeCost: baseItem.base_upgrade_cost * 2,
        hourlyEarn: newHourlyEarn,
      }
    }

    // User already has this item, upgrade it
    const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return { success: false, message: "User not found" }
    }

    // Check if user has enough coins
    if (user.coins < userItem.upgrade_cost) {
      return { success: false, message: "Not enough coins" }
    }

    // Calculate new values
    const newLevel = userItem.level + 1
    const newHourlyIncome = Math.floor(userItem.hourly_income * 1.5)
    const newUpgradeCost = Math.floor(userItem.upgrade_cost * 2)

    // Update user item
    const { error: updateError } = await supabase
      .from("user_items")
      .update({
        level: newLevel,
        hourly_income: newHourlyIncome,
        upgrade_cost: newUpgradeCost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userItem.id)

    if (updateError) {
      console.error("Error upgrading item:", updateError)
      return { success: false, message: "Error upgrading item" }
    }

    // Deduct coins from user
    await updateUserCoins(
      userId,
      -userItem.upgrade_cost,
      "item_upgrade",
      `Upgraded item ${itemId} to level ${newLevel}`,
    )

    // Update user hourly earn and return the new value
    const newHourlyEarn = await updateUserHourlyEarn(userId)

    return {
      success: true,
      level: newLevel,
      hourlyIncome: newHourlyIncome,
      upgradeCost: newUpgradeCost,
      hourlyEarn: newHourlyEarn,
    }
  } catch (error) {
    console.error("Error in upgradeItem:", error)
    return { success: false, message: "An error occurred while upgrading the item" }
  }
}

// Task related actions
export async function getUserTasks(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("user_tasks")
    .select(`
      *,
      tasks (*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user tasks:", error)
    return []
  }

  return data
}

export async function startTask(userId: string, taskId: number) {
  const supabase = createServerClient()

  // Check if user task exists
  const { data: existingTask, error: checkError } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking task:", checkError)
    return { success: false, message: "Error checking task" }
  }

  if (existingTask) {
    // Task exists, update progress
    const newProgress = Math.min(100, existingTask.progress + 50)

    const { error: updateError } = await supabase
      .from("user_tasks")
      .update({
        progress: newProgress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTask.id)

    if (updateError) {
      console.error("Error updating task:", updateError)
      return { success: false, message: "Error updating task" }
    }

    return { success: true, progress: newProgress, userTaskId: existingTask.id }
  } else {
    // Create new user task
    const { data: newTask, error: createError } = await supabase
      .from("user_tasks")
      .insert([
        {
          user_id: userId,
          task_id: taskId,
          progress: 50,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error("Error creating task:", createError)
      return { success: false, message: "Error creating task" }
    }

    return { success: true, progress: 50, userTaskId: newTask.id }
  }
}

export async function completeTask(userId: string, taskId: number) {
  const supabase = createServerClient()

  // Get task details
  const { data: userTask, error: taskError } = await supabase
    .from("user_tasks")
    .select("*, tasks (reward)")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .single()

  if (taskError) {
    console.error("Error fetching user task:", taskError)
    return { success: false, message: "Task not found" }
  }

  // Check if task is already completed
  if (userTask.is_completed) {
    return { success: false, message: "Task already completed" }
  }

  // Check if task progress is 100%
  if (userTask.progress < 100) {
    return { success: false, message: "Task not ready to complete" }
  }

  // Update task status
  const { error: updateError } = await supabase
    .from("user_tasks")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", userTask.id)

  if (updateError) {
    console.error("Error completing task:", updateError)
    return { success: false, message: "Error completing task" }
  }

  // Add coins to user
  const reward = userTask.tasks.reward
  await updateUserCoins(userId, reward, "task_reward", `Completed task ${taskId}`)

  return { success: true, reward }
}

// Daily rewards actions
export async function getUserDailyRewards(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("user_daily_rewards")
    .select(`
      *,
      daily_rewards (*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user daily rewards:", error)
    return []
  }

  return data
}

export async function claimDailyReward(userId: string, day: number) {
  const supabase = createServerClient()

  // Get reward details
  const { data: reward, error: rewardError } = await supabase.from("daily_rewards").select("*").eq("day", day).single()

  if (rewardError) {
    console.error("Error fetching daily reward:", rewardError)
    return { success: false, message: "Reward not found" }
  }

  // Check if already claimed
  const { data: userReward, error: userRewardError } = await supabase
    .from("user_daily_rewards")
    .select("*")
    .eq("user_id", userId)
    .eq("day", day)
    .single()

  if (!userRewardError && userReward && userReward.claimed) {
    return { success: false, message: "Reward already claimed" }
  }

  // Update or insert user reward
  if (userReward) {
    const { error: updateError } = await supabase
      .from("user_daily_rewards")
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", userReward.id)

    if (updateError) {
      console.error("Error claiming reward:", updateError)
      return { success: false, message: "Error claiming reward" }
    }
  } else {
    const { error: insertError } = await supabase.from("user_daily_rewards").insert([
      {
        user_id: userId,
        day,
        claimed: true,
        claimed_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error("Error claiming reward:", insertError)
      return { success: false, message: "Error claiming reward" }
    }
  }

  // Add coins to user
  await updateUserCoins(userId, reward.reward, "daily_reward", `Claimed day ${day} reward`)

  return { success: true, reward: reward.reward }
}

// Similarly update the energy function to handle rate limiting
export async function updateUserEnergy(userId: string, amount: number) {
  const supabase = createServerClient()
  try {
    // First, get current energy
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("energy, max_energy")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user energy:", userError)
      return null
    }

    // Calculate new energy (never below 0 or above max)
    const newEnergy = Math.max(0, Math.min(userData.max_energy, userData.energy + amount))

    const { error: updateError } = await supabase
      .from("users")
      .update({
        energy: newEnergy,
        last_energy_regen: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      // Check if this is a rate limit error
      if (updateError.message && updateError.message.includes("Too Many Requests")) {
        console.warn("Rate limit hit when updating energy. Using local value.")
        return null // Return null to indicate rate limiting
      }

      console.error("Error updating user energy:", updateError)
      return null
    }

    return newEnergy
  } catch (error) {
    // Handle JSON parsing errors that occur with rate limiting
    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.warn("Rate limit hit when updating energy (JSON parse error). Using local value.")
      return null // Return null to indicate rate limiting
    }

    console.error("Error in updateUserEnergy:", error)
    throw error
  }
}

// Boost related actions
export async function getUserBoosts(userId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("user_boosts").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user boosts:", error)
    return null
  }

  return data
}

export async function upgradeBoost(userId: string, boostType: string) {
  const supabase = createServerClient()

  // Get user details
  const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { success: false, message: "User not found" }
  }

  // Get current boost level
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return { success: false, message: "Boosts not found" }
  }

  // Determine which boost to upgrade and calculate cost
  const updateData: any = { updated_at: new Date().toISOString() }
  let newLevel = 0
  let cost = 0

  switch (boostType) {
    case "multiTouch":
      newLevel = boost.multi_touch_level + 1
      cost = 2000 * Math.pow(1.5, boost.multi_touch_level - 1)
      updateData.multi_touch_level = newLevel
      break
    case "energyLimit":
      newLevel = boost.energy_limit_level + 1
      cost = 2000 * Math.pow(1.5, boost.energy_limit_level - 1)
      updateData.energy_limit_level = newLevel
      break
    case "chargeSpeed":
      newLevel = boost.charge_speed_level + 1
      cost = 2000 * Math.pow(1.5, boost.charge_speed_level - 1)
      updateData.charge_speed_level = newLevel
      break
    default:
      return { success: false, message: "Invalid boost type" }
  }

  // Check if user has enough coins
  if (user.coins < cost) {
    return { success: false, message: "Not enough coins" }
  }

  // Update boost
  const { error: updateError } = await supabase.from("user_boosts").update(updateData).eq("user_id", userId)

  if (updateError) {
    console.error("Error upgrading boost:", updateError)
    return { success: false, message: "Error upgrading boost" }
  }

  // Deduct coins from user
  await updateUserCoins(userId, -cost, "boost_upgrade", `Upgraded ${boostType} to level ${newLevel}`)

  // If it's multiTouch, update user's earn_per_tap
  if (boostType === "multiTouch") {
    await supabase
      .from("users")
      .update({
        earn_per_tap: 1 + (newLevel - 1) * 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  // If it's energyLimit, update user's max_energy
  if (boostType === "energyLimit") {
    await supabase
      .from("users")
      .update({
        max_energy: 100 + (newLevel - 1) * 500,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  return { success: true, newLevel, cost: Math.floor(cost * 1.5) }
}

export async function useRocketBoost(userId: string) {
  const supabase = createServerClient()

  // Get user boosts
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("daily_rockets")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return { success: false, message: "Boosts not found" }
  }

  // Check if user has rockets left
  if (boost.daily_rockets <= 0) {
    return { success: false, message: "No rockets left" }
  }

  // Update rockets count
  const { error: updateError } = await supabase
    .from("user_boosts")
    .update({
      daily_rockets: boost.daily_rockets - 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error using rocket:", updateError)
    return { success: false, message: "Error using rocket" }
  }

  // Add energy to user
  await updateUserEnergy(userId, 500)

  return { success: true, rocketsLeft: boost.daily_rockets - 1 }
}

export async function useFullEnergyBoost(userId: string) {
  const supabase = createServerClient()

  // Get user boosts
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("energy_full_used")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return { success: false, message: "Boosts not found" }
  }

  // Check if user has already used full energy today
  if (boost.energy_full_used) {
    return { success: false, message: "Full energy already used today" }
  }

  // Update energy_full_used
  const { error: updateError } = await supabase
    .from("user_boosts")
    .update({
      energy_full_used: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("Error using full energy:", updateError)
    return { success: false, message: "Error using full energy" }
  }

  // Get user's max energy
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("energy, max_energy")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { success: false, message: "User not found" }
  }

  // Fill user's energy to max
  await updateUserEnergy(userId, user.max_energy - user.energy)

  return { success: true }
}

// Referral system
export async function createReferral(referrerId: string, referredId: string) {
  const supabase = createServerClient()

  // Check if referral already exists
  const { data: existingReferral, error: checkError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .eq("referred_id", referredId)
    .single()

  if (!checkError && existingReferral) {
    return { success: false, message: "Referral already exists" }
  }

  // Create referral
  const { error: createError } = await supabase.from("referrals").insert([
    {
      referrer_id: referrerId,
      referred_id: referredId,
      reward_amount: 100000,
      is_claimed: false,
    },
  ])

  if (createError) {
    console.error("Error creating referral:", createError)
    return { success: false, message: "Error creating referral" }
  }

  return { success: true }
}

export async function getUserReferrals(userId: string) {
  const supabase = createServerClient()

  // Get referrals where user is the referrer
  const { data, error } = await supabase
    .from("referrals")
    .select(`
      *,
      referred:referred_id(id, username)
    `)
    .eq("referrer_id", userId)

  if (error) {
    console.error("Error fetching referrals:", error)
    return []
  }

  return data
}

export async function claimReferralReward(userId: string, referralId: string) {
  const supabase = createServerClient()

  // Get referral details
  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .select("*")
    .eq("id", referralId)
    .eq("referrer_id", userId)
    .single()

  if (referralError) {
    console.error("Error fetching referral:", referralError)
    return { success: false, message: "Referral not found" }
  }

  // Check if already claimed
  if (referral.is_claimed) {
    return { success: false, message: "Reward already claimed" }
  }

  // Update referral
  const { error: updateError } = await supabase
    .from("referrals")
    .update({
      is_claimed: true,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", referralId)

  if (updateError) {
    console.error("Error claiming referral:", updateError)
    return { success: false, message: "Error claiming referral" }
  }

  // Add coins to user
  await updateUserCoins(userId, referral.reward_amount, "referral_reward", `Claimed referral reward`)

  return { success: true, reward: referral.reward_amount }
}

// Daily combo system
export async function createDailyCombo(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  // Check if combo already exists for today
  const { data: existingCombo, error: checkError } = await supabase
    .from("daily_combo")
    .select("*")
    .eq("user_id", userId)
    .eq("day_date", today)
    .single()

  if (!checkError && existingCombo) {
    return existingCombo
  }

  // Generate 3 random card IDs (using item IDs from 1-10)
  const cardIds = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10) + 1)

  // Create daily combo
  const { data, error } = await supabase
    .from("daily_combo")
    .insert([
      {
        user_id: userId,
        day_date: today,
        card_ids: cardIds,
        found_card_ids: [],
        reward: 100000,
        is_completed: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating daily combo:", error)
    return null
  }

  return data
}

export async function getUserDailyCombo(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  // Get today's combo
  const { data, error } = await supabase
    .from("daily_combo")
    .select("*")
    .eq("user_id", userId)
    .eq("day_date", today)
    .single()

  if (error) {
    // If no combo exists for today, create one
    if (error.code === "PGRST116") {
      return await createDailyCombo(userId)
    }

    console.error("Error fetching daily combo:", error)
    return null
  }

  return data
}

export async function findDailyComboCard(userId: string, cardIndex: number) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  // Get today's combo
  const { data: combo, error: comboError } = await supabase
    .from("daily_combo")
    .select("*")
    .eq("user_id", userId)
    .eq("day_date", today)
    .single()

  if (comboError) {
    console.error("Error fetching daily combo:", comboError)
    return { success: false, message: "Daily combo not found" }
  }

  // Check if card index is valid
  if (cardIndex < 0 || cardIndex >= combo.card_ids.length) {
    return { success: false, message: "Invalid card index" }
  }

  // Check if card is already found
  const cardId = combo.card_ids[cardIndex]
  if (combo.found_card_ids.includes(cardId)) {
    return { success: false, message: "Card already found" }
  }

  // Add card to found cards
  const newFoundCards = [...combo.found_card_ids, cardId]
  const isCompleted = newFoundCards.length === combo.card_ids.length

  // Update combo
  const updateData: any = {
    found_card_ids: newFoundCards,
    updated_at: new Date().toISOString(),
  }

  if (isCompleted) {
    updateData.is_completed = true
    updateData.completed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase.from("daily_combo").update(updateData).eq("id", combo.id)

  if (updateError) {
    console.error("Error updating daily combo:", updateError)
    return { success: false, message: "Error updating daily combo" }
  }

  // If combo is completed, give reward
  if (isCompleted) {
    await updateUserCoins(userId, combo.reward, "daily_combo", "Completed daily combo")
  }

  return {
    success: true,
    cardId,
    foundCardIds: newFoundCards,
    isCompleted,
    reward: isCompleted ? combo.reward : 0,
  }
}

// Hourly earnings
export async function collectHourlyEarnings(userId: string) {
  const supabase = createServerClient()

  // Get user details
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("hourly_earn, last_hourly_collect")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return { success: false, message: "User not found" }
  }

  const now = new Date()
  const lastCollect = new Date(user.last_hourly_collect)
  const hoursPassed = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)

  // Check if at least 1 hour has passed
  if (hoursPassed < 1) {
    return {
      success: false,
      message: "Not enough time has passed",
      timeLeft: 60 - Math.floor(hoursPassed * 60),
    }
  }

  // Calculate coins to collect (max 24 hours)
  const hoursToCount = Math.min(hoursPassed, 24)
  const coinsToCollect = Math.floor(user.hourly_earn * hoursToCount)

  // Update last collect time
  const { error: updateError } = await supabase
    .from("users")
    .update({
      last_hourly_collect: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating last collect time:", updateError)
    return { success: false, message: "Error updating last collect time" }
  }

  // Add coins to user
  await updateUserCoins(
    userId,
    coinsToCollect,
    "hourly_earnings",
    `Collected ${hoursToCount.toFixed(1)} hours of earnings`,
  )

  return { success: true, coins: coinsToCollect, hours: hoursToCount }
}

// Reset daily boosts
export async function resetDailyBoosts() {
  const supabase = createServerClient()

  // Reset all users' daily rockets and energy_full_used
  const { error } = await supabase.from("user_boosts").update({
    daily_rockets: 3,
    energy_full_used: false,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error resetting daily boosts:", error)
    return { success: false }
  }

  return { success: true }
}
