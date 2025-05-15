"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import AdminSidebar from "@/components/Admin/AdminSidebar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faPlus, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

export default function AdminMissions() {
  const router = useRouter()
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMission, setEditingMission] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: 0,
    link: "",
    category: "Social",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push("/admin")
      } else {
        fetchMissions()
      }
    }
    
    checkAuth()
  }, [router])

  const fetchMissions = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("id", { ascending: true })

      if (error) {
        throw error
      }

      setMissions(data || [])
    } catch (error) {
      console.error("Error fetching missions:", error)
      toast.error("Failed to load missions")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    })
  }

  const handleAddMission = () => {
    setEditingMission(null)
    setFormData({
      title: "",
      description: "",
      reward: 0,
      link: "",
      category: "Social",
    })
    setShowModal(true)
  }

  const handleEditMission = (mission: any) => {
    setEditingMission(mission)
    setFormData({
      title: mission.title,
      description: mission.description,
      reward: mission.reward,
      link: mission.link,
      category: mission.category,
    })
    setShowModal(true)
  }

  const handleDeleteMission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mission?")) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("missions").delete().eq("id", id)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = getSupabaseClient()
      
      if (editingMission) {
        // Update existing mission
        const { error } = await supabase
          .from("missions")
          .update(formData)
          .eq("id", editingMission.id)

        if (error) throw error
        toast.success("Mission updated successfully")
      } else {
        // Add new mission
        const { error } = await supabase.from("missions").insert(formData)
        if (error) throw error
        toast.success("Mission added successfully")
      }
      
      setShowModal(false)
      fetchMissions()
    } catch (error) {
      console.error("Error saving mission:", error)
      toast.error("Failed to save mission")
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Missions</h1>
          <button
            onClick={handleAddMission}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add New Mission
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {missions.map((mission) => (
                  <tr key={mission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{mission.reward}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <a 
                        href={mission.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        <span className="truncate max-w-xs">{mission.link}</span>
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleEditMission(mission)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteMission(mission.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Mission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingMission ? "Edit Mission" : "Add New Mission"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                >
                  <option value="Social">Social</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Games">Games</option>
                  <option value="Surveys">Surveys</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Reward</label>
                <input
                  type="number"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Link</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                  {editingMission ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
