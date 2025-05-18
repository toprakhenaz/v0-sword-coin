"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import TaskNav from "@/components/TaskNav"
import { useUser } from "@/app/context/UserContext"
import EarnPageSkeletonLoading from "@/components/skeletons/SkeletonEarn"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins, faGem, faCheck, faLock } from "@fortawesome/free-solid-svg-icons"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function EarnPage() {
  const { user, loading, addCoins, addCrystals } = useUser()
  const [activeCategory, setActiveCategory] = useState("Crypto")
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return

      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("is_active", true)
          .eq("category", activeCategory)
          .order("id")

        if (tasksError) throw tasksError

        // Fetch user tasks
        const { data: userTasksData, error: userTasksError } = await supabase
          .from("user_tasks")
          .select("*")
          .eq("user_id", user.id)

        if (userTasksError) throw userTasksError

        // Combine the data
        const combinedTasks = tasksData.map((task) => {
          const userTask = userTasksData.find((ut) => ut.task_id === task.id)
          return {
            ...task,
            isCompleted: userTask ? userTask.is_completed : false,
            isClaimed: userTask ? userTask.is_claimed : false,
          }
        })

        setTasks(combinedTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoadingTasks(false)
      }
    }

    const checkDailyReward = async () => {
      if (!user) return

      try {
        const today = new Date().toISOString().split("T")[0]
        const { data, error } = await supabase
          .from("daily_rewards")
          .select("*")
          .eq("user_id", user.id)
          .eq("claimed_date", today)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows returned"
          throw error
        }

        setDailyRewardClaimed(!!data)
      } catch (error) {
        console.error("Error checking daily reward:", error)
      }
    }

    if (user) {
      fetchTasks()
      checkDailyReward()
    }
  }, [user, activeCategory, supabase])

  const claimDailyReward = async () => {
    if (!user || dailyRewardClaimed) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const rewardAmount = 1000

      // Record the claim
      const { error } = await supabase.from("daily_rewards").insert({
        user_id: user.id,
        claimed_date: today,
        amount: rewardAmount,
      })

      if (error) throw error

      // Add coins to the user
      await addCoins(rewardAmount)

      // Update state
      setDailyRewardClaimed(true)

      toast({
        title: "Daily Reward Claimed",
        description: `You received ${rewardAmount} coins!`,
      })
    } catch (error) {
      console.error("Error claiming daily reward:", error)
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive",
      })
    }
  }

  const claimTaskReward = async (taskId) => {
    if (!user) return

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || !task.isCompleted || task.isClaimed) return

      // Update the user task
      const { error: updateError } = await supabase
        .from("user_tasks")
        .update({ is_claimed: true })
        .eq("user_id", user.id)
        .eq("task_id", taskId)

      if (updateError) throw updateError

      // Add reward to the user
      if (task.reward_type === "coins") {
        await addCoins(task.reward_amount)
      } else if (task.reward_type === "crystals") {
        await addCrystals(task.reward_amount)
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          if (t.id === taskId) {
            return { ...t, isClaimed: true }
          }
          return t
        }),
      )

      toast({
        title: "Task Reward Claimed",
        description: `You received ${task.reward_amount} ${task.reward_type}!`,
      })
    } catch (error) {
      console.error("Error claiming task reward:", error)
      toast({
        title: "Error",
        description: "Failed to claim task reward",
        variant: "destructive",
      })
    }
  }

  if (loading || !user || loadingTasks) {
    return <EarnPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <HeaderCard />

      {/* Daily Reward */}
      <div className="bg-gradient-to-r from-yellow-600 to-amber-700 rounded-lg p-4 mb-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Daily Reward</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-yellow-200 mb-1">Claim your daily reward</p>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCoins} className="text-yellow-300 mr-2" />
              <span className="font-bold">1,000 coins</span>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              dailyRewardClaimed
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
            onClick={claimDailyReward}
            disabled={dailyRewardClaimed}
          >
            {dailyRewardClaimed ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Claimed
              </>
            ) : (
              "Claim"
            )}
          </button>
        </div>
      </div>

      {/* Task Navigation */}
      <div className="mb-4">
        <TaskNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>

      {/* Tasks List */}
      <div className="space-y-4 pb-20">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={task.reward_type === "coins" ? faCoins : faGem}
                    className={`mr-2 ${task.reward_type === "coins" ? "text-yellow-400" : "text-purple-400"}`}
                  />
                  <span className="font-bold">{task.reward_amount}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                {task.isCompleted ? (
                  <button
                    className={`px-4 py-2 rounded-lg font-medium ${
                      task.isClaimed
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    onClick={() => claimTaskReward(task.id)}
                    disabled={task.isClaimed}
                  >
                    {task.isClaimed ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                        Claimed
                      </>
                    ) : (
                      "Claim Reward"
                    )}
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium cursor-not-allowed">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Complete Task
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No tasks available in this category</p>
          </div>
        )}
      </div>

      <Navbar />
    </main>
  )
}
