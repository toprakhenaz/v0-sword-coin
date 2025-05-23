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
        total_hourly_coins: 0,
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
  await getOrCreateDailyCombo(data.id)

  return data
}

export async function getOrCreateUser(telegramId: string, username: string) {
  let user = await getUserByTelegramId(telegramId)

  if (!user) {
    user = await createUser(telegramId, username)
  }

  return user
}

// getOrCreateDailyCombo fonksiyonunu değiştir (satır 1070-1150 civarı)
export async function getOrCreateDailyCombo(userId?: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get or create global daily combo for today
    let { data: globalCombo, error: globalError } = await supabase
      .from("global_daily_combo")
      .select("*")
      .eq("combo_date", today)
      .single()

    if (globalError && globalError.code === "PGRST116") {
      // Create new global combo
      const { data: items } = await supabase
        .from("items")
        .select("id")
      
      const validCardIds = items ? items.map(item => item.id) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      
      // Select 3 random cards
      const selectedCardIds: number[] = []
      const tempIds = [...validCardIds]
      
      for (let i = 0; i < 3 && tempIds.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * tempIds.length)
        selectedCardIds.push(tempIds[randomIndex])
        tempIds.splice(randomIndex, 1)
      }
      
      const { data: newCombo, error: createError } = await supabase
        .from("global_daily_combo")
        .insert([{
          combo_date: today,
          card_ids: selectedCardIds,
          reward: 100000
        }])
        .select()
        .single()
      
      if (createError) {
        console.error("Error creating global daily combo:", createError)
        return null
      }
      
      globalCombo = newCombo
    }

    if (!globalCombo) return null

    // If userId provided, get user's progress
    if (userId) {
      const { data: userProgress } = await supabase
        .from("user_daily_combo_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("combo_date", today)
        .single()

      return {
        card_ids: globalCombo.card_ids,
        found_card_ids: userProgress?.found_card_ids || [],
        reward: globalCombo.reward,
        is_completed: userProgress?.is_completed || false
      }
    }

    return {
      card_ids: globalCombo.card_ids,
      found_card_ids: [],
      reward: globalCombo.reward,
      is_completed: false
    }
  } catch (error) {
    console.error("Error in getOrCreateDailyCombo:", error)
    return null
  }
}

// Task'ları veritabanından çek
export async function getAllTasks() {
  const supabase = createServerClient()
  
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return tasks
}

// Items'ları veritabanından çek
export async function getAllItems() {
  const supabase = createServerClient()
  
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error fetching items:", error)
    return []
  }

  return items
}

// lib/db-actions.ts - updateUserCoins fonksiyonunu güncelle (satır 65 civarı)
export async function updateUserCoins(userId: string, amount: number, transactionType: string, description?: string) {
  const supabase = createServerClient()
  try {
    // Get current user coins
    const { data: userData, error: userError } = await supabase.from("users").select("coins").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return null
    }

    // coins değerini number olarak al
    const currentCoins = parseFloat(userData.coins) || 0
    
    // Yeni coin miktarını hesapla ve tam sayıya yuvarla
    const newCoins = Math.floor(Math.max(0, currentCoins + amount))

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins
      })
      .eq("id", userId)

    if (updateError) {
      // Rate limit kontrolü
      if (updateError.message && updateError.message.includes("Too Many Requests")) {
        console.warn("Rate limit hit when updating coins. Using local value.")
        return null
      }

      console.error("Error updating user coins:", updateError)
      return null
    }

    // Transaction kaydı - opsiyonel
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
      console.error("Error logging coin transaction:", transactionError)
    }

    return newCoins
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.warn("Rate limit hit when updating coins (JSON parse error). Using local value.")
      return null
    }

    console.error("Error in updateUserCoins:", error)
    throw error
  }
}

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
        // last_energy_regen alanını da kaldırdık
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
  const updateData: any = {} // updated_at alanını kaldırdık
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
      })
      .eq("id", userId)
  }

  // If it's energyLimit, update user's max_energy
  if (boostType === "energyLimit") {
    await supabase
      .from("users")
      .update({
        max_energy: 100 + (newLevel - 1) * 500,
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

  // Update last collect time - sadece last_hourly_collect güncelleyelim
  const { error: updateError } = await supabase
    .from("users")
    .update({
      last_hourly_collect: now.toISOString(),
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

export async function startTask(userId: string, taskId: number, taskUrl?: string) {
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

    return { success: true, progress: newProgress, userTaskId: existingTask.id, url: taskUrl }
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

    return { success: true, progress: 50, userTaskId: newTask.id, url: taskUrl }
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

// Add these new functions for the daily combo system


// Get user's daily combo
export async function getUserDailyCombo(userId: string) {
  return getOrCreateDailyCombo(userId)
}

// findDailyComboCard fonksiyonunu güncelle (satır 1200 civarı)
export async function findDailyComboCard(userId: string, cardIndex: number) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get global combo
    const { data: globalCombo } = await supabase
      .from("global_daily_combo")
      .select("*")
      .eq("combo_date", today)
      .single()

    if (!globalCombo) {
      return { success: false, message: "Daily combo not found" }
    }

    const cardId = globalCombo.card_ids[cardIndex]

    // Get or create user progress
    let { data: userProgress } = await supabase
      .from("user_daily_combo_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("combo_date", today)
      .single()

    if (!userProgress) {
      // Create new progress
      const { data: newProgress } = await supabase
        .from("user_daily_combo_progress")
        .insert([{
          user_id: userId,
          combo_date: today,
          found_card_ids: []
        }])
        .select()
        .single()
      
      userProgress = newProgress
    }

    if (!userProgress) {
      return { success: false, message: "Failed to create progress" }
    }

    // Check if already found
    if (userProgress.found_card_ids.includes(cardId)) {
      return {
        success: false,
        message: "Card already found",
        cardId,
        foundCardIds: userProgress.found_card_ids,
        isCompleted: userProgress.is_completed
      }
    }

    // Add to found cards
    const newFoundCards = [...userProgress.found_card_ids, cardId]
    const isCompleted = newFoundCards.length === globalCombo.card_ids.length

    // Update progress
    const { error: updateError } = await supabase
      .from("user_daily_combo_progress")
      .update({
        found_card_ids: newFoundCards,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq("id", userProgress.id)

    if (updateError) {
      console.error("Error updating progress:", updateError)
      return { success: false, message: "Error updating progress" }
    }

    // Give reward if completed
    if (isCompleted) {
      await updateUserCoins(userId, globalCombo.reward, "daily_combo", "Completed daily combo")
    }

    return {
      success: true,
      cardId,
      foundCardIds: newFoundCards,
      isCompleted,
      reward: isCompleted ? globalCombo.reward : 0
    }
  } catch (error) {
    console.error("Error in findDailyComboCard:", error)
    return { success: false, message: "An error occurred" }
  }
}

// Get token listing countdown date
export async function getTokenListingDate() {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", "token_listing_date").single()

    if (error) {
      console.error("Error fetching token listing date:", error)

      // Return a default date (3 months from now) if there's an error
      const defaultDate = new Date()
      defaultDate.setMonth(defaultDate.getMonth() + 3)
      return { date: defaultDate.toISOString() }
    }

    return { date: data.value }
  } catch (error) {
    console.error("Error in getTokenListingDate:", error)

    // Return a default date (3 months from now) if there's an error
    const defaultDate = new Date()
    defaultDate.setMonth(defaultDate.getMonth() + 3)
    return { date: defaultDate.toISOString() }
  }
}

export async function getUserDailyStreak(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Check if user has claimed today's reward
    const { data: todayReward, error: todayError } = await supabase
      .from("user_daily_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("claimed_at::date", today)
      .maybeSingle()

    const canCheckIn = !todayReward

    // Get user's streak by counting consecutive days
    const { data: recentRewards, error: recentError } = await supabase
      .from("user_daily_rewards")
      .select("claimed_at")
      .eq("user_id", userId)
      .order("claimed_at", { ascending: false })
      .limit(30)

    if (recentError) {
      console.error("Error fetching recent rewards:", recentError)
      return { streak: 0, canCheckIn: true, lastCheckIn: null, reward: 500 }
    }

    // Calculate streak based on consecutive days
    let streak = 0
    if (recentRewards && recentRewards.length > 0) {
      // Create a Set of unique dates (YYYY-MM-DD format)
      const uniqueDates = new Set(
        recentRewards.map((reward) => new Date(reward.claimed_at).toISOString().split("T")[0]),
      )

      // Convert to array and sort in descending order
      const sortedDates = Array.from(uniqueDates).sort().reverse()

      // Start with the most recent day
      if (sortedDates.length > 0) {
        let lastDate = new Date(sortedDates[0])
        streak = 1 // Start with 1 for the most recent day

        // Check for consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i])
          const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

          // If the difference is 1 day, increment streak
          if (dayDiff === 1) {
            streak++
            lastDate = currentDate
          } else {
            // Break the streak if not consecutive
            break
          }
        }
      }
    }

    // Get the reward for the current streak day
    const nextStreakDay = (streak % 7) + 1
    const { data: rewardData } = await supabase
      .from("daily_rewards")
      .select("reward")
      .eq("day", nextStreakDay)
      .maybeSingle()

    // Default rewards if daily_rewards table doesn't exist
    const defaultRewards = [
      { day: 1, reward: 100 },
      { day: 2, reward: 200 },
      { day: 3, reward: 300 },
      { day: 4, reward: 400 },
      { day: 5, reward: 500 },
      { day: 6, reward: 600 },
      { day: 7, reward: 2000 },
    ]

    // Use default reward if table doesn't exist
    const reward = rewardData?.reward || defaultRewards.find((r) => r.day === nextStreakDay)?.reward || 500

    return {
      streak,
      canCheckIn,
      lastCheckIn: recentRewards && recentRewards.length > 0 ? new Date(recentRewards[0].claimed_at) : null,
      reward,
    }
  } catch (error) {
    console.error("Error in getUserDailyStreak:", error)
    return { streak: 0, canCheckIn: true, lastCheckIn: null, reward: 500 }
  }
}

export async function claimDailyReward(userId: string) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Check if already claimed today
    const { data: todayReward, error: todayError } = await supabase
      .from("user_daily_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("claimed_at::date", today)
      .maybeSingle()

    if (todayReward) {
      return { success: false, message: "Already claimed today's reward" }
    }

    // Get user's current streak
    const { streak } = await getUserDailyStreak(userId)

    // New streak will be current streak + 1
    const newStreak = streak + 1

    // Calculate which day of the week (1-7) this is
    const streakDay = newStreak % 7 || 7 // Convert 0 to 7 for the 7th day

    // Get the reward amount
    const { data: rewardData, error: rewardError } = await supabase
      .from("daily_rewards")
      .select("reward")
      .eq("day", streakDay)
      .maybeSingle()

    // Default rewards if table doesn't exist
    const defaultRewards = [
      { day: 1, reward: 100 },
      { day: 2, reward: 200 },
      { day: 3, reward: 300 },
      { day: 4, reward: 400 },
      { day: 5, reward: 500 },
      { day: 6, reward: 600 },
      { day: 7, reward: 2000 },
    ]

    const rewardAmount = rewardData?.reward || defaultRewards.find((r) => r.day === streakDay)?.reward || 500

    // Check if a record already exists for this user and day
    const { data: existingRecord, error: existingError } = await supabase
      .from("user_daily_rewards")
      .select("id")
      .eq("user_id", userId)
      .eq("day", streakDay)
      .maybeSingle()

    // Record this claim in user_daily_rewards - either update or insert
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("user_daily_rewards")
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id)

      if (updateError) {
        console.error("Error updating reward claim:", updateError)
        return { success: false, message: "Error updating reward claim" }
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase.from("user_daily_rewards").insert([
        {
          user_id: userId,
          day: streakDay,
          claimed: true,
          claimed_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        console.error("Error recording reward claim:", insertError)
        return { success: false, message: "Error recording reward claim" }
      }
    }

    // Add coins to user
    await updateUserCoins(userId, rewardAmount, "daily_reward", `Day ${streakDay} streak reward`)

    return {
      success: true,
      reward: rewardAmount,
      streak: newStreak,
      streakDay,
    }
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return { success: false, message: "Error processing reward claim" }
  }
}

// Get tasks with their URLs
export async function getTasksWithUrls() {
  const supabase = createServerClient()
  
  // Get tasks from database
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Add URLs to tasks
  const tasksWithUrls = tasks.map(task => {
    let url = ""
    switch (task.platform?.toLowerCase()) {
      case "youtube":
        url = "https://youtube.com/@swordcoin"
        break
      case "twitter":
        url = "https://twitter.com/swordcoin"
        break
      case "telegram":
        url = "https://t.me/swordcoin"
        break
      case "instagram":
        url = "https://instagram.com/swordcoin"
        break
      case "facebook":
        url = "https://facebook.com/swordcoin"
        break
      case "linkedin":
        url = "https://linkedin.com/company/swordcoin"
        break
      case "binance":
        url = "https://accounts.binance.com/register"
        break
      default:
        url = task.link || ""
    }
    
    return { ...task, url }
  })

  return tasksWithUrls
}