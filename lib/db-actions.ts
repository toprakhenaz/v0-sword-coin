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
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  // Create initial boosts for the user
  await supabase.from("user_boosts").insert([{ user_id: data.id }])

  return data
}

export async function getOrCreateUser(telegramId: string, username: string) {
  let user = await getUserByTelegramId(telegramId)

  if (!user) {
    user = await createUser(telegramId, username)
  }

  return user
}

export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  const supabase = createServerClient()

  // Start a transaction
  const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return null
  }

  const newCoins = user.coins + amount

  // Update user coins
  const { error: updateError } = await supabase
    .from("users")
    .update({ coins: newCoins, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user coins:", updateError)
    return null
  }

  // Log transaction
  const { error: transactionError } = await supabase.from("transactions").insert([
    {
      user_id: userId,
      amount,
      transaction_type: transactionType,
      description,
    },
  ])

  if (transactionError) {
    console.error("Error logging transaction:", transactionError)
  }

  return newCoins
}

// Item related actions
export async function getUserItems(userId: string) {
  const supabase = createServerClient()
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
}

export async function upgradeItem(userId: string, itemId: number) {
  const supabase = createServerClient()

  // Get user and item details
  const { data: userItem, error: itemError } = await supabase
    .from("user_items")
    .select("*")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .single()

  if (itemError) {
    console.error("Error fetching user item:", itemError)
    return null
  }

  const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return null
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
  await updateUserCoins(userId, -userItem.upgrade_cost, "item_upgrade", `Upgraded item ${itemId} to level ${newLevel}`)

  // Update user hourly earn
  await updateUserHourlyEarn(userId)

  return {
    success: true,
    level: newLevel,
    hourlyIncome: newHourlyIncome,
    upgradeCost: newUpgradeCost,
  }
}

// Calculate and update user's total hourly earn
async function updateUserHourlyEarn(userId: string) {
  const supabase = createServerClient()

  // Get all user items
  const { data: userItems, error: itemsError } = await supabase
    .from("user_items")
    .select("hourly_income")
    .eq("user_id", userId)

  if (itemsError) {
    console.error("Error fetching user items:", itemsError)
    return
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
    return null
  }

  // Check if task is already completed
  if (userTask.is_completed) {
    return { success: false, message: "Task already completed" }
  }

  // Update task status
  const { error: updateError } = await supabase
    .from("user_tasks")
    .update({
      progress: 100,
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
    return null
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

// Energy related actions
export async function updateUserEnergy(userId: string, amount: number) {
  const supabase = createServerClient()

  // Get user details
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("energy, max_energy")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return null
  }

  // Calculate new energy (ensure it doesn't go below 0 or above max)
  const newEnergy = Math.max(0, Math.min(user.max_energy, user.energy + amount))

  // Update user energy
  const { error: updateError } = await supabase
    .from("users")
    .update({
      energy: newEnergy,
      last_energy_regen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user energy:", updateError)
    return null
  }

  return newEnergy
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

export async function upgradeBoost(userId: string, boostType: string, cost: number) {
  const supabase = createServerClient()

  // Get user details
  const { data: user, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return null
  }

  // Check if user has enough coins
  if (user.coins < cost) {
    return { success: false, message: "Not enough coins" }
  }

  // Get current boost level
  const { data: boost, error: boostError } = await supabase
    .from("user_boosts")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (boostError) {
    console.error("Error fetching user boosts:", boostError)
    return null
  }

  // Determine which boost to upgrade
  const updateData: any = { updated_at: new Date().toISOString() }
  let newLevel = 0

  switch (boostType) {
    case "multiTouch":
      newLevel = boost.multi_touch_level + 1
      updateData.multi_touch_level = newLevel
      break
    case "energyLimit":
      newLevel = boost.energy_limit_level + 1
      updateData.energy_limit_level = newLevel
      // Also update user's max energy
      await supabase
        .from("users")
        .update({
          max_energy: 100 + (newLevel - 1) * 500,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      break
    case "chargeSpeed":
      newLevel = boost.charge_speed_level + 1
      updateData.charge_speed_level = newLevel
      break
    default:
      return { success: false, message: "Invalid boost type" }
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

  return { success: true, newLevel }
}
