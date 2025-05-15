"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faCoins, faSwords, faTasks } from "@fortawesome/free-solid-svg-icons"
import AdminSidebar from "@/components/Admin/AdminSidebar"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
    totalCards: 0,
    totalMissions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/admin")
      } else {
        fetchStats()
      }
    }

    checkAuth()
  }, [router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Get total users
      const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Get active users (logged in within the last 24 hours)
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      const { count: activeUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("last_login", oneDayAgo.toISOString())

      // Get total coins
      const { data: coinsData } = await supabase.from("users").select("coins")
      const totalCoins = coinsData?.reduce((sum, user) => sum + user.coins, 0) || 0

      // Get total cards
      const { count: totalCards } = await supabase.from("cards").select("*", { count: "exact", head: true })

      // Get total missions
      const { count: totalMissions } = await supabase.from("missions").select("*", { count: "exact", head: true })

      // Get recent users
      const { data: recentUsersData } = await supabase
        .from("users")
        .select("id, username, first_name, last_name, coins, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalCoins,
        totalCards: totalCards || 0,
        totalMissions: totalMissions || 0,
      })

      setRecentUsers(recentUsersData || [])
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={faUsers}
            color="bg-blue-600"
            subtitle={`${stats.activeUsers} active in last 24h`}
          />
          <StatCard
            title="Total Coins"
            value={stats.totalCoins}
            icon={faCoins}
            color="bg-yellow-600"
            subtitle="In circulation"
          />
          <StatCard
            title="Total Cards"
            value={stats.totalCards}
            icon={faSwords}
            color="bg-purple-600"
            subtitle="Available in game"
          />
          <StatCard
            title="Total Missions"
            value={stats.totalMissions}
            icon={faTasks}
            color="bg-green-600"
            subtitle="Available to complete"
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Coins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.coins}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string
  value: number
  icon: any
  color: string
  subtitle: string
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <FontAwesomeIcon icon={icon} className="text-white text-xl" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
