"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import Navbar from "@/components/Navbar"
import HeaderCard from "@/components/HeaderCard"
import Popup from "@/components/Popup"
import EarnPageSkeletonLoading from "@/components/SkeletonEarn"
import { useLeagueData } from "@/data/GeneralData"
import TaskCard from "@/components/Earn/TaskCard"
import { supabase } from "@/lib/supabase"
import { getTokenListingDate, getUserDailyStreak, claimDailyReward, startTask, completeTask, getTasksWithUrls } from "@/lib/db-actions"
import DailyCombo from "@/components/Earn/DailyCombo"
import { setupDailyRewardsTable } from "@/lib/setup-daily-rewards"

interface Task {
  id: number
  title: string
  description: string
  reward: number
  progress: number
  isCompleted: boolean
  category: string
  platform: string
  platformLogo: string
  userTaskId?: string
  url?: string
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function EarnPage() {
  const { userId, coins, league, isLoading: userLoading, updateCoins } = useUser()
  const { getLeagueColors } = useLeagueData()
  const leagueColors = getLeagueColors(league)

  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDailyCheckedIn, setIsDailyCheckedIn] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(0)
  const [dailyReward, setDailyReward] = useState(500)
  const [streakDay, setStreakDay] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })

  // Countdown timer state
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLoadingCountdown, setIsLoadingCountdown] = useState(true)

  // Fetch token listing date from database and set up countdown
  useEffect(() => {
    const fetchTokenListingDate = async () => {
      try {
        setIsLoadingCountdown(true)
        const { date } = await getTokenListingDate()
        const targetDate = new Date(date)

        const updateCountdown = () => {
          const now = new Date()
          const difference = targetDate.getTime() - now.getTime()

          if (difference <= 0) {
            // Countdown finished
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            return
          }

          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          setCountdown({ days, hours, minutes, seconds })
        }

        // Update immediately
        updateCountdown()
        setIsLoadingCountdown(false)

        // Update every second
        const interval = setInterval(updateCountdown, 1000)

        // Clean up interval
        return () => clearInterval(interval)
      } catch (error) {
        console.error("Error fetching token listing date:", error)
        setIsLoadingCountdown(false)

        // Use default date (3 months from now) if there's an error
        const defaultDate = new Date()
        defaultDate.setMonth(defaultDate.getMonth() + 3)

        const updateCountdown = () => {
          const now = new Date()
          const difference = defaultDate.getTime() - now.getTime()

          if (difference <= 0) {
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            return
          }

          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          setCountdown({ days, hours, minutes, seconds })
        }

        // Update immediately
        updateCountdown()

        // Update every second
        const interval = setInterval(updateCountdown, 1000)

        // Clean up interval
        return () => clearInterval(interval)
      }
    }

    fetchTokenListingDate()
  }, [])

  useEffect(() => {
    const loadDailyStreakInfo = async () => {
      if (!userId) return

      try {
        const streakInfo = await getUserDailyStreak(userId)
        setDailyStreak(streakInfo.streak)
        setIsDailyCheckedIn(!streakInfo.canCheckIn)
        setDailyReward(streakInfo.reward)
        // Calculate streak day (1-7)
        setStreakDay((streakInfo.streak % 7) + 1)
      } catch (error) {
        console.error("Error loading daily streak info:", error)
        // Set defaults in case of error
        setDailyStreak(0)
        setIsDailyCheckedIn(false)
        setDailyReward(100)
        setStreakDay(1)
      }
    }

    if (userId && !userLoading) {
      loadDailyStreakInfo()
    }
  }, [userId, userLoading])

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      if (!userId) return

      try {
        // Get tasks with URLs from database
        const tasksData = await getTasksWithUrls()

        // Get user's task progress
        const { data: userTasks } = await supabase
          .from("user_tasks")
          .select("*")
          .eq("user_id", userId)

        // Create a map of user tasks for quick lookup
        const userTasksMap = new Map()
        if (userTasks) {
          userTasks.forEach(task => {
            userTasksMap.set(task.task_id, task)
          })
        }

        // Merge tasks with user progress
        const mergedTasks = tasksData.map(task => {
          const userTask = userTasksMap.get(task.id)
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            reward: task.reward,
            progress: userTask?.progress || 0,
            isCompleted: userTask?.is_completed || false,
            category: task.category,
            platform: task.platform,
            platformLogo: task.platform?.toLowerCase() || "",
            userTaskId: userTask?.id,
            url: task.url
          }
        })

        setTasks(mergedTasks)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading tasks:", error)
        setIsLoading(false)
      }
    }

    if (userId && !userLoading) {
      loadTasks()
    }
  }, [userId, userLoading])

  // Add this useEffect after the other useEffects
  useEffect(() => {
    // Set up the daily rewards table if needed
    const setupRewards = async () => {
      if (userId) {
        try {
          await setupDailyRewardsTable()
        } catch (error) {
          console.error("Error setting up daily rewards:", error)
        }
      }
    }

    setupRewards()
  }, [userId])

  const handleStartTask = async (taskId: number) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !userId) return

    try {
      // Start the task and get the URL
      const result = await startTask(userId, taskId, task.url)
      
      if (result.success) {
        // Update task progress locally
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, progress: result.progress || 50 }
          }
          return t
        })
        setTasks(updatedTasks)

        // Open the URL in a new tab
        if (result.url) {
          window.open(result.url, '_blank')
        }

        // Show popup for starting task
        setPopupData({
          title: "Task Started",
          message: `You've started "${task.title}". Complete the action to claim your reward!`,
          image: task.platformLogo || "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error starting task:", error)
    }
  }

  const handleClaimReward = async (taskId: number) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.progress !== 100 || task.isCompleted || !userId) return

    try {
      const result = await completeTask(userId, taskId)
      
      if (result.success) {
        // Update task as completed locally
        const updatedTasks = tasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, isCompleted: true }
          }
          return t
        })
        setTasks(updatedTasks)

        // Add tokens to user
        await updateCoins(result.reward || task.reward, "task_reward", `Completed task ${taskId}`)

        // Show success popup
        setPopupData({
          title: "Task Completed!",
          message: `You earned ${(result.reward || task.reward).toLocaleString()} tokens!`,
          image: "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const handleTaskAction = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.progress === 100 && !task.isCompleted) {
      handleClaimReward(taskId)
    } else if (task.progress === 0) {
      handleStartTask(taskId)
    } else {
      // Task is in progress, increase progress to 100%
      const updatedTasks = tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, progress: 100 }
        }
        return t
      })
      setTasks(updatedTasks)
      
      // Show popup that task is ready to claim
      setPopupData({
        title: "Task Ready",
        message: `"${task.title}" is ready to claim!`,
        image: task.platformLogo || "/coin.png",
      })
      setShowPopup(true)
    }
  }

  const handleDailyCheckIn = async () => {
    if (isDailyCheckedIn || !userId) return

    try {
      const result = await claimDailyReward(userId)

      if (result.success) {
        // Update local state
        setIsDailyCheckedIn(true)
        setDailyStreak(result.streak || 0)
        setStreakDay(result.streakDay || 1)

        // Update coins
        await updateCoins(result.reward || 0, "daily_reward", "Daily check-in reward")

        // Show success popup
        setPopupData({
          title: "Daily Check-in Complete!",
          message: `You earned ${result.reward} tokens! Your streak is now ${result.streak} days.`,
          image: "/coin.png",
        })
        setShowPopup(true)
      } else {
        // Show error popup
        setPopupData({
          title: "Check-in Failed",
          message: result.message || "Failed to claim daily reward.",
          image: "/coin.png",
        })
        setShowPopup(true)
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error)
      setPopupData({
        title: "Check-in Failed",
        message: "An error occurred while claiming your reward.",
        image: "/coin.png",
      })
      setShowPopup(true)
    }
  }

  const filteredTasks = tasks

  if (isLoading || userLoading) {
    return <EarnPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-[#0d1220] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      {/* Main content container with consistent styling */}
      <div className="px-4">
        {/* Token Listing Countdown - Only keeping this part */}
        <div
          className="mb-4 rounded-xl overflow-hidden border border-gray-700/50"
          style={{
            background: `linear-gradient(135deg, ${leagueColors.primary}40, ${leagueColors.secondary}60)`,
          }}
        >
          <div className="p-4 relative">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/patterns/sword-pattern.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* Token Listing Countdown - Only keeping this part */}
            <div>
              <div className="text-gray-200 text-sm mb-2 text-center">Token Listing Countdown</div>
              <div className="flex justify-center space-x-3">
                {isLoadingCountdown ? (
                  // Loading skeleton
                  <>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-md bg-gray-700/70 animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-300 mt-1 w-8 h-3 bg-gray-700/70 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Actual countdown
                  <>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.days.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Days</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Hours</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Mins</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                        {countdown.seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">Secs</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DailyCombo
          reward={dailyReward}
          isCheckedIn={isDailyCheckedIn}
          onCheckIn={handleDailyCheckIn}
          league={league}
          streak={dailyStreak}
          streakDay={streakDay}
        />

        {/* Tasks Section with New Task Card Design */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Available Tasks</h2>
            <span className="text-sm text-gray-400">{filteredTasks.length} tasks</span>
          </div>

          {filteredTasks.length > 0 ? (
            <div
              className="overflow-y-auto scrollbar-hide rounded-lg"
              style={{
                maxHeight: "350px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="space-y-3 pr-1">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    reward={task.reward}
                    platform={task.platform}
                    platformLogo={task.platformLogo}
                    progress={task.progress}
                    isCompleted={task.isCompleted}
                    onClick={() => handleTaskAction(task.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/70 rounded-xl p-6 text-center">
              <p className="text-gray-400">No tasks available in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
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