"use client"

import { useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"
import AdminLeagueModal from "./AdminLeagueModal"

export default function AdminLeagueList() {
  const { supabase } = useSupabase()
  const [leagues, setLeagues] = useState<any[]>([
    { id: 1, name: "Bronze", requiredCoins: 0, reward: 0, image: "/leagues/league-1.png" },
    { id: 2, name: "Silver", requiredCoins: 10000, reward: 5000, image: "/leagues/league-2.png" },
    { id: 3, name: "Gold", requiredCoins: 50000, reward: 25000, image: "/leagues/league-3.png" },
    { id: 4, name: "Platinum", requiredCoins: 100000, reward: 50000, image: "/leagues/league-4.png" },
    { id: 5, name: "Diamond", requiredCoins: 500000, reward: 250000, image: "/leagues/league-5.png" },
    { id: 6, name: "Master", requiredCoins: 1000000, reward: 500000, image: "/leagues/league-6.png" },
    { id: 7, name: "Grandmaster", requiredCoins: 5000000, reward: 2500000, image: "/leagues/league-7.png" },
    { id: 8, name: "Challenger", requiredCoins: 10000000, reward: 5000000, image: "/leagues/league-8.png" },
    { id: 9, name: "Legend", requiredCoins: 50000000, reward: 25000000, image: "/leagues/league-9.png" },
    { id: 10, name: "Mythic", requiredCoins: 100000000, reward: 50000000, image: "/leagues/league-10.png" },
  ])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentLeague, setCurrentLeague] = useState<any>(null)

  const handleEdit = (league: any) => {
    setCurrentLeague(league)
    setIsModalOpen(true)
  }

  const handleSave = async (leagueData: any) => {
    // In a real implementation, this would save to the database
    setLeagues(leagues.map((league) => (league.id === leagueData.id ? leagueData : league)))

    toast.success("League settings updated successfully")
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">League Management</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    League
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Required Coins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leagues.map((league) => (
                  <tr key={league.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={league.image || "/placeholder.svg"}
                            alt={league.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">League {league.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{league.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {league.requiredCoins.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {league.reward.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(league)} className="text-indigo-400 hover:text-indigo-300 mr-3">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AdminLeagueModal league={currentLeague} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  )
}
