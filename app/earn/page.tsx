"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import TaskNav from "@/components/TaskNav"
import { Progress } from "@/components/Progress"
import { Button } from "@/components/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"
import Popup from "@/components/Popup"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserContext"
import EarnPageSkeletonLoading from "@/components/SkeletonEarn"

interface Task {
  id: number
  title: string
  description: string
  reward: number
  progress: number
  isCompleted: boolean
  category: string
  userTaskId?: string // Reference to user_tasks table
}

interface DailyReward {
  day: number
  reward: number
  claimed: boolean
}

export default function EarnPage() {
  const { userId, coins, league, isLoading: userLoading, updateCoins } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Günlük")
  const [tasks, setTasks] = useState<Task[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([])
  const [currentDay, setCurrentDay] = useState(1)
  const [specialOffers, setSpecialOffers] = useState([
    {
      id: "offer1",
      title: "2x Kazanç Boost",
      description: "24 saat boyunca tüm kazançlarını ikiye katla!",
      reward: "2x Boost",
      image: "/boost-power.png",
      color: "from-blue-600 to-blue-800",
    },
    {
      id: "offer2",
      title: "VIP Paket",
      description: "Özel VIP avantajları ve 5000 coin!",
      reward: "5000 Coin",
      image: "/vip-badge.png",
      color: "from-purple-600 to-purple-800",
    },
  ])
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)

  // Load tasks and daily rewards from database
  useEffect(() => {
    const loadTasksAndRewards = async () => {
      if (!userId) return

      try {
        // Load tasks
        const { data: allTasks } = await supabase.from("tasks").select("*")

        if (!allTasks) {
          console.error("No tasks found")
          setIsLoading(false)
          return
        }

        // Load user tasks
        const { data: userTasks } = await supabase.from("user_tasks").select("*").eq("user_id", userId)

        // Create a map of user tasks for quick lookup
        const userTasksMap = new Map()
        if (userTasks) {
          userTasks.forEach((userTask) => {
            userTasksMap.set(userTask.task_id, userTask)
          })
        }

        // Process tasks
        const processedTasks: Task[] = allTasks.map((task) => {
          const userTask = userTasksMap.get(task.id)

          return {
            id: task.id,
            title: task.title,
            description: task.description,
            reward: task.reward,
            category: task.category,
            progress: userTask ? userTask.progress : 0,
            isCompleted: userTask ? userTask.is_completed : false,
            userTaskId: userTask ? userTask.id : undefined,
          }
        })

        setTasks(processedTasks)

        // Load daily rewards
        const { data: rewardData } = await supabase.from("daily_rewards").select("*").order("day")

        if (!rewardData) {
          console.error("No daily rewards found")
          setIsLoading(false)
          return
        }

        // Load user daily rewards
        const { data: userRewards } = await supabase.from("user_daily_rewards").select("*").eq("user_id", userId)

        // Create a map of user rewards for quick lookup
        const userRewardsMap = new Map()
        if (userRewards) {
          userRewards.forEach((userReward) => {
            userRewardsMap.set(userReward.day, userReward)
          })
        }

        // Process daily rewards
        const processedRewards: DailyReward[] = rewardData.map((reward) => {
          const userReward = userRewardsMap.get(reward.day)

          return {
            day: reward.day,
            reward: reward.reward,
            claimed: userReward ? userReward.claimed : false,
          }
        })

        setDailyRewards(processedRewards)

        // Determine current day (first unclaimed day)
        const firstUnclaimed = processedRewards.find((reward) => !reward.claimed)
        if (firstUnclaimed) {
          setCurrentDay(firstUnclaimed.day)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading tasks and rewards:", error)
        setIsLoading(false)
      }
    }

    if (userId && !userLoading) {
      loadTasksAndRewards()
    }
  }, [userId, userLoading])

  const handleStartTask = async (taskId: number) => {
    if (!userId) return

    try {
      // Check if user task exists
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      if (!task.userTaskId) {
        // Create user task
        const { data: newUserTask, error: insertError } = await supabase
          .from("user_tasks")
          .insert([
            {
              user_id: userId,
              task_id: taskId,
              progress: 50, // Simulate progress for demo
            },
          ])
          .select()
          .single()

        if (insertError) {
          console.error("Error creating user task:", insertError)
          return
        }

        // Update local state
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, progress: 50, userTaskId: newUserTask.id } : t)))
      } else {
        // Update existing user task
        const { error: updateError } = await supabase
          .from("user_tasks")
          .update({
            progress: 100,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.userTaskId)

        if (updateError) {
          console.error("Error updating user task:", updateError)
          return
        }

        // Update local state
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, progress: 100 } : t)))
      }
    } catch (error) {
      console.error("Error starting task:", error)
    }
  }

  const handleClaimReward = async (taskId: number) => {
    if (!userId) return

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || task.progress !== 100 || task.isCompleted || !task.userTaskId) return

      // Update task status
      const { error: updateError } = await supabase
        .from("user_tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.userTaskId)

      if (updateError) {
        console.error("Error completing task:", updateError)
        return
      }

      // Update local state
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t)))

      // Add coins to user
      await updateCoins(task.reward, "task_reward", `Completed task ${taskId}`)

      // Show success popup
      setPopupData({
        title: "Görev Tamamlandı!",
        message: `${task.reward} coin kazandınız!`,
        image: "/coin.png",
      })
      setShowPopup(true)
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
  }

  const handleClaimDailyReward = async (day: number) => {
    if (!userId) return

    try {
      const reward = dailyRewards.find((r) => r.day === day)
      if (!reward || reward.claimed || day !== currentDay) return

      // Check if user reward exists
      const { data: existingReward } = await supabase
        .from("user_daily_rewards")
        .select("*")
        .eq("user_id", userId)
        .eq("day", day)
        .single()

      if (existingReward) {
        // Update existing reward
        const { error: updateError } = await supabase
          .from("user_daily_rewards")
          .update({
            claimed: true,
            claimed_at: new Date().toISOString(),
          })
          .eq("id", existingReward.id)

        if (updateError) {
          console.error("Error claiming reward:", updateError)
          return
        }
      } else {
        // Create new user reward
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
          return
        }
      }

      // Update local state
      setDailyRewards(dailyRewards.map((r) => (r.day === day ? { ...r, claimed: true } : r)))

      // Find next unclaimed day
      const nextUnclaimed = dailyRewards.find((r) => !r.claimed && r.day > day)
      if (nextUnclaimed) {
        setCurrentDay(nextUnclaimed.day)
      }

      // Add coins to user
      await updateCoins(reward.reward, "daily_reward", `Claimed day ${day} reward`)

      // Show success popup
      setPopupData({
        title: "Günlük Ödül!",
        message: `Gün ${day}: ${reward.reward} coin kazandınız!`,
        image: "/coin.png",
      })
      setShowPopup(true)
    } catch (error) {
      console.error("Error claiming daily reward:", error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeCategory === "Günlük") return true
    return task.category === activeCategory
  })

  const categories = ["Günlük", "Crypto", "Banka", "Sponsor", "Reklam"]

  if (isLoading || userLoading) {
    return <EarnPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-[#0d1220] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      {/* Hero Banner */}
      <div className="relative h-32 mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-80"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/placeholder-tdma2.png')" }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-2xl font-bold mb-1 text-yellow-300 drop-shadow-lg">Görevler & Ödüller</h1>
          <p className="text-sm text-white drop-shadow-md">Görevleri tamamla, ödülleri topla!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {/* Daily Rewards */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <h2 className="text-lg font-bold mb-3 flex items-center">
            <FontAwesomeIcon icon={icons.star} className="text-yellow-400 mr-2" />
            Günlük Giriş Ödülleri
          </h2>

          <div className="flex overflow-x-auto scrollbar-hide pb-2">
            {dailyRewards.map((reward) => (
              <div
                key={reward.day}
                className={`flex-shrink-0 w-16 mr-2 flex flex-col items-center ${
                  reward.day === currentDay && !reward.claimed ? "animate-pulse" : ""
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center mb-1 ${
                    reward.claimed
                      ? "bg-gray-700"
                      : reward.day === currentDay
                        ? "bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg"
                        : "bg-gray-700 opacity-60"
                  }`}
                >
                  {reward.claimed ? (
                    <FontAwesomeIcon icon={icons.check} className="text-green-400 text-xl" />
                  ) : reward.day === 7 ? (
                    <div className="relative">
                      <FontAwesomeIcon icon={icons.coins} className="text-yellow-300 text-xl" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-300 text-xl" />
                  )}
                </div>
                <div className="text-xs font-medium">Gün {reward.day}</div>
                <div className={`text-xs ${reward.claimed ? "text-gray-500" : "text-yellow-400"}`}>{reward.reward}</div>

                {reward.day === currentDay && !reward.claimed && (
                  <button
                    onClick={() => handleClaimDailyReward(reward.day)}
                    className="mt-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-0.5 rounded-full"
                  >
                    Topla
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <TaskNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {/* Tasks List */}
        {activeCategory === "Günlük" ? (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold flex items-center">
              <FontAwesomeIcon icon={icons.star} className="text-yellow-400 mr-2" />
              Özel Teklifler
            </h2>

            {specialOffers.map((offer) => (
              <div
                key={offer.id}
                className={`bg-gradient-to-r ${offer.color} rounded-lg p-3 shadow-lg flex items-center`}
              >
                <div className="w-16 h-16 rounded-lg bg-black bg-opacity-30 flex items-center justify-center mr-3">
                  <img src={offer.image || "/placeholder.svg"} alt={offer.title} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{offer.title}</h3>
                  <p className="text-xs text-gray-200">{offer.description}</p>
                </div>
                <div className="ml-2">
                  <button className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                    Al
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-3 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-300">{task.description}</p>
                  </div>
                  <div className="flex items-center text-yellow-300 text-sm">
                    <FontAwesomeIcon icon={icons.coins} className="mr-1" />
                    <span>{task.reward}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>İlerleme</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />
                </div>

                <div className="flex justify-end">
                  {task.progress < 100 ? (
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs py-1 px-3"
                      onClick={() => handleStartTask(task.id)}
                    >
                      Başla
                    </Button>
                  ) : task.isCompleted ? (
                    <Button className="bg-gray-600 text-gray-300 text-xs py-1 px-3" disabled>
                      Tamamlandı
                    </Button>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-green-500 to-green-700 text-white text-xs py-1 px-3"
                      onClick={() => handleClaimReward(task.id)}
                    >
                      Ödülü Al
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPopup && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          image={popupData.image}
          onClose={() => setShowPopup(false)}
        />
      )}

      <Navbar />
    </main>
  )
}
