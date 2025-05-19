"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import Navbar from "@/components/Navbar"
import HeaderCard from "@/components/HeaderCard"
import TokenCounter from "@/components/Earn/TokenCounter"
import TaskCategory from "@/components/Earn/TaskCategory"
import TaskCard from "@/components/Earn/TaskCard"
import DailyCombo from "@/components/Earn/DailyCombo"
import Popup from "@/components/Popup"
import { motion } from "framer-motion"
import EarnPageSkeletonLoading from "@/components/SkeletonEarn"

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
}

export default function EarnPage() {
  const { userId, coins, league, isLoading: userLoading, updateCoins } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDailyCheckedIn, setIsDailyCheckedIn] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(3) // Example streak count
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })

  // Token data
  const [totalTokens, setTotalTokens] = useState(5200)

  // Categories - removed "Daily"
  const categories = ["All", "Crypto", "Social", "Learn"]

  // Load tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      if (!userId) return

      try {
        // Simulated tasks data - in a real app, this would come from the database
        const mockTasks: Task[] = [
          {
            id: 2,
            title: "Follow on Twitter",
            description: "Follow SwordCoin on Twitter for a reward",
            reward: 200,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "Twitter",
            platformLogo: "/platform-logos/twitter.png",
          },
          {
            id: 3,
            title: "Join Telegram Group",
            description: "Join our community on Telegram",
            reward: 150,
            progress: 50,
            isCompleted: false,
            category: "Social",
            platform: "Telegram",
            platformLogo: "/platform-logos/telegram.png",
          },
          {
            id: 4,
            title: "Complete Crypto Quiz",
            description: "Test your knowledge about cryptocurrencies",
            reward: 300,
            progress: 0,
            isCompleted: false,
            category: "Learn",
            platform: "SwordCoin",
            platformLogo: "/hamster-avatar.png",
          },
          {
            id: 5,
            title: "Verify on Binance",
            description: "Connect your Binance account to earn tokens",
            reward: 500,
            progress: 0,
            isCompleted: false,
            category: "Crypto",
            platform: "Binance",
            platformLogo: "/platform-logos/binance.png",
          },
          {
            id: 6,
            title: "Watch Tutorial Video",
            description: "Learn how to use SwordCoin app features",
            reward: 100,
            progress: 100,
            isCompleted: true,
            category: "Learn",
            platform: "YouTube",
            platformLogo: "/platform-logos/youtube.png",
          },
          {
            id: 7,
            title: "Share on Social Media",
            description: "Share SwordCoin on your social media",
            reward: 250,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "Instagram",
            platformLogo: "/platform-logos/instagram.png",
          },
          {
            id: 8,
            title: "Refer a Friend",
            description: "Invite a friend to join SwordCoin",
            reward: 400,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "SwordCoin",
            platformLogo: "/hamster-avatar.png",
          },
        ]

        setTasks(mockTasks)
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

  const handleStartTask = async (taskId: number) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Update task progress
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        // If progress is 0, set to 50%, otherwise set to 100%
        const newProgress = t.progress === 0 ? 50 : 100
        return { ...t, progress: newProgress }
      }
      return t
    })

    setTasks(updatedTasks)

    // Show popup for starting task
    setPopupData({
      title: "Task Started",
      message: `You've started "${task.title}"`,
      image: task.platformLogo,
    })
    setShowPopup(true)
  }

  const handleClaimReward = async (taskId: number) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.progress !== 100 || task.isCompleted) return

    // Update task as completed
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, isCompleted: true }
      }
      return t
    })

    setTasks(updatedTasks)

    // Add tokens to user
    await updateCoins(task.reward, "task_reward", `Completed task ${taskId}`)

    // Update token balance
    setTotalTokens(totalTokens + task.reward)

    // Show success popup
    setPopupData({
      title: "Task Completed!",
      message: `You earned ${task.reward} tokens!`,
      image: "/coin.png",
    })
    setShowPopup(true)
  }

  const handleTaskAction = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.progress === 100 && !task.isCompleted) {
      handleClaimReward(taskId)
    } else {
      handleStartTask(taskId)
    }
  }

  const handleDailyCheckIn = async () => {
    if (isDailyCheckedIn) return

    // Mark as checked in
    setIsDailyCheckedIn(true)

    // Daily reward amount
    const dailyReward = 500

    // Add tokens to user
    await updateCoins(dailyReward, "daily_check_in", "Daily check-in reward")

    // Update token balance
    setTotalTokens(totalTokens + dailyReward)

    // Show success popup
    setPopupData({
      title: "Daily Check-in Complete!",
      message: `You earned ${dailyReward} tokens! Come back tomorrow for another reward.`,
      image: "/coin.png",
    })
    setShowPopup(true)

    // In a real app, you would update the streak in the database
    setDailyStreak(dailyStreak + 1)
  }

  const filteredTasks = activeCategory === "All" ? tasks : tasks.filter((task) => task.category === activeCategory)

  if (isLoading || userLoading) {
    return <EarnPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-[#0d1220] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      {/* Token Counter */}
      <div className="px-4">
        <TokenCounter totalTokens={totalTokens} league={league} />
      </div>

      {/* Daily Check-in */}
      <div className="px-4">
        <DailyCombo
          reward={500}
          isCheckedIn={isDailyCheckedIn}
          onCheckIn={handleDailyCheckIn}
          league={league}
          streak={dailyStreak}
        />
      </div>

      {/* Task Categories */}
      <div className="px-4">
        <TaskCategory categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>

      {/* Tasks Section with Vertical Scrollable List */}
      <div className="px-4 mb-6">
        <motion.div
          className="mb-2 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-white">Available Tasks</h2>
          <span className="text-sm text-gray-400">{filteredTasks.length} tasks</span>
        </motion.div>

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
          <motion.div
            className="bg-gray-800/70 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-400">No tasks available in this category</p>
          </motion.div>
        )}
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
