"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import Navbar from "@/components/Navbar"
import HeaderCard from "@/components/HeaderCard"
import Popup from "@/components/Popup"
import EarnPageSkeletonLoading from "@/components/SkeletonEarn"
import { useLeagueData } from "@/data/GeneralData"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import TaskCard from "@/components/Earn/TaskCard"

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
  const { getLeagueColors } = useLeagueData()
  const leagueColors = getLeagueColors(league)

  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDailyCheckedIn, setIsDailyCheckedIn] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(2) // Example streak count
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })

  // Token data
  const [totalTokens, setTotalTokens] = useState(5200)

  // Categories
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
            title: "Follow on YouTube",
            description: "YouTube kanalında zil butonuna tıklayın.",
            reward: 15000,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "YouTube",
            platformLogo: "/platform-logos/youtube.png",
          },
          {
            id: 3,
            title: "Follow on Twitter",
            description: "SwordCoin'i X platformunda takip edin.",
            reward: 8000,
            progress: 50,
            isCompleted: false,
            category: "Social",
            platform: "Twitter",
            platformLogo: "/platform-logos/twitter.png",
          },
          {
            id: 4,
            title: "Follow on LinkedIn",
            description: "SwordCoin'i LinkedIn'de takip edin.",
            reward: 3000,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "LinkedIn",
            platformLogo: "",
          },
          {
            id: 5,
            title: "Follow on Facebook",
            description: "Facebook'ta SwordCoin'i takip edin.",
            reward: 3000,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "Facebook",
            platformLogo: "",
          },
          {
            id: 6,
            title: "Follow on Instagram",
            description: "SwordCoin'i Instagram'da takip edin.",
            reward: 1000,
            progress: 100,
            isCompleted: true,
            category: "Social",
            platform: "Instagram",
            platformLogo: "/platform-logos/instagram.png",
          },
          {
            id: 7,
            title: "Join Telegram Group",
            description: "SwordCoin Telegram grubuna katılın.",
            reward: 5000,
            progress: 0,
            isCompleted: false,
            category: "Social",
            platform: "Telegram",
            platformLogo: "/platform-logos/telegram.png",
          },
          {
            id: 8,
            title: "Verify on Binance",
            description: "Binance hesabınızı bağlayın.",
            reward: 10000,
            progress: 0,
            isCompleted: false,
            category: "Crypto",
            platform: "Binance",
            platformLogo: "/platform-logos/binance.png",
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
      image: task.platformLogo || "/coin.png",
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
      message: `You earned ${task.reward.toLocaleString()} tokens!`,
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

      {/* Main content container with consistent styling */}
      <div className="px-4">
        {/* Token Counter - Always visible, not collapsible */}
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

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${leagueColors.primary}, ${leagueColors.secondary})`,
                    boxShadow: `0 4px 10px ${leagueColors.glow}50`,
                  }}
                >
                  <FontAwesomeIcon icon={icons.coins} className="text-yellow-300 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Token Balance</h2>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Listing Countdown - Always visible */}
            <div className="mt-4">
              <div className="text-gray-200 text-sm mb-2 text-center">Token Listing Countdown</div>
              <div className="flex justify-center space-x-3">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                    90
                  </div>
                  <div className="text-xs text-gray-300 mt-1">Days</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                    12
                  </div>
                  <div className="text-xs text-gray-300 mt-1">Hours</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                    45
                  </div>
                  <div className="text-xs text-gray-300 mt-1">Mins</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                    30
                  </div>
                  <div className="text-xs text-gray-300 mt-1">Secs</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <div className="text-sm text-gray-300">Exchange Listing</div>
              <div className="text-white font-medium">Binance, KuCoin, Gate.io</div>
            </div>
          </div>
        </div>

        {/* Daily Reward - Using league colors */}
        <div
          className="mb-4 rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(to right, ${leagueColors.primary}, ${leagueColors.secondary})`,
            boxShadow: `0 4px 12px ${leagueColors.glow}40`,
          }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Günlük Ödül</h2>
                <p className="text-sm text-white/80">Streak: {dailyStreak} gün</p>
              </div>
              <button
                onClick={handleDailyCheckIn}
                disabled={isDailyCheckedIn}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDailyCheckedIn ? "bg-gray-700/50 text-gray-400 cursor-not-allowed" : "bg-yellow-300 text-yellow-900"
                }`}
              >
                <FontAwesomeIcon icon={icons.gift} className="mr-2" />
                {isDailyCheckedIn ? "Alındı" : "Ödülü Al"}
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 relative h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="absolute h-full left-0 top-0 rounded-full bg-blue-500"
                style={{ width: `${(dailyStreak / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Task Categories */}
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 p-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? "text-white shadow-lg"
                    : "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 hover:text-white"
                }`}
                style={
                  activeCategory === category
                    ? {
                        background: `linear-gradient(to right, ${leagueColors.primary}, ${leagueColors.secondary})`,
                        boxShadow: `0 2px 8px ${leagueColors.glow}50`,
                      }
                    : {}
                }
                onClick={() => setActiveCategory(category)}
              >
                {getCategoryIcon(category)}
                <span className="ml-1">{category}</span>
              </button>
            ))}
          </div>
        </div>

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

// Helper function for category icons
function getCategoryIcon(category: string) {
  switch (category) {
    case "All":
      return <FontAwesomeIcon icon={icons.listCheck} className="text-gray-300" />
    case "Daily":
      return <FontAwesomeIcon icon={icons.calendar} className="text-gray-300" />
    case "Crypto":
      return <FontAwesomeIcon icon={icons.coins} className="text-yellow-400" />
    case "Social":
      return <FontAwesomeIcon icon={icons.userGroup} className="text-gray-300" />
    case "Learn":
      return <FontAwesomeIcon icon={icons.bookOpen} className="text-gray-300" />
    default:
      return <FontAwesomeIcon icon={icons.listCheck} className="text-gray-300" />
  }
}
