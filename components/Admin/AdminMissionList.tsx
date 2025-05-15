"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSearch, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons"
import AdminMissionModal from "./AdminMissionModal"

export default function AdminMissionList() {
  const { supabase } = useSupabase()
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMission, setCurrentMission] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  const fetchMissions = async () => {
    if (!supabase) return

    try {
      setLoading(true)

      let query = supabase.from("general_missions").select("*").order("id", { ascending: true })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (categoryFilter) {
        query = query.eq("category", categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setMissions(data || [])

      // Get unique categories
      const uniqueCategories = Array.from(new Set((data || []).map((mission) => mission.category)))
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error("Error fetching missions:", error)
      toast.error("Failed to load missions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMissions()
  }, [supabase, searchTerm, categoryFilter])

  const handleEdit = (mission: any) => {
    setCurrentMission(mission)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setCurrentMission(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!supabase) return

    if (!window.confirm("Are you sure you want to delete this mission? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("general_missions").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast.success("Mission deleted successfully")
      fetchMissions()
    } catch (error) {
      console.error("Error deleting mission:", error)
      toast.error("Failed to delete mission")
    }
  }

  const handleSave = async (missionData: any) => {
    if (!supabase) return

    try {
      if (missionData.id) {
        // Update existing mission
        const { error } = await supabase.from("general_missions").update(missionData).eq("id", missionData.id)

        if (error) {
          throw error
        }

        toast.success("Mission updated successfully")
      } else {
        // Create new mission
        const { error } = await supabase.from("general_missions").insert(missionData)

        if (error) {
          throw error
        }

        toast.success("Mission created successfully")
      }

      setIsModalOpen(false)
      fetchMissions()
    } catch (error) {
      console.error("Error saving mission:", error)
      toast.error("Failed to save mission")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Missions</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Mission
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search missions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {missions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                      No missions found
                    </td>
                  </tr>
                ) : (
                  missions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {mission.reward_coins} coins
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 space-x-2">
                        <button
                          onClick={() => handleEdit(mission)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button
                          onClick={() => handleDelete(mission.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AdminMissionModal
          mission={currentMission}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
