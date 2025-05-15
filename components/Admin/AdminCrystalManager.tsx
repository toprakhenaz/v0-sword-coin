"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faGem, faCoins, faSave } from "@fortawesome/free-solid-svg-icons"

export default function AdminCrystalManager() {
  const { supabase } = useSupabase()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10
  const [editMode, setEditMode] = useState<Record<number, { coins: number; crystals: number }>>({})

  const fetchUsers = async () => {
    if (!supabase) return

    try {
      setLoading(true)

      // Get total count for pagination
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true })
      setTotalPages(Math.ceil((count || 0) / pageSize))

      // Fetch users with pagination
      let query = supabase
        .from("users")
        .select("id, username, first_name, last_name, coins, crystals")
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("id", { ascending: true })

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`,
        )
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [supabase, page, searchTerm])

  const handleEdit = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditMode({
        ...editMode,
        [userId]: { coins: user.coins, crystals: user.crystals },
      })
    }
  }

  const handleChange = (userId: number, field: "coins" | "crystals", value: string) => {
    setEditMode({
      ...editMode,
      [userId]: {
        ...editMode[userId],
        [field]: Number.parseInt(value) || 0,
      },
    })
  }

  const handleSave = async (userId: number) => {
    if (!supabase) return

    try {
      const { coins, crystals } = editMode[userId]

      // In a real implementation, this would update the database
      const { error } = await supabase.from("users").update({ coins, crystals }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, coins, crystals } : user)))

      // Clear edit mode for this user
      const newEditMode = { ...editMode }
      delete newEditMode[userId]
      setEditMode(newEditMode)

      toast.success("User currency updated successfully")
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user currency")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Currency Management</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <FontAwesomeIcon icon={faCoins} className="mr-2 text-yellow-400" />
                      Coins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <FontAwesomeIcon icon={faGem} className="mr-2 text-purple-400" />
                      Crystals
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">
                        {editMode[user.id] ? (
                          <input
                            type="number"
                            value={editMode[user.id].coins}
                            onChange={(e) => handleChange(user.id, "coins", e.target.value)}
                            className="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          user.coins.toLocaleString()
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                        {editMode[user.id] ? (
                          <input
                            type="number"
                            value={editMode[user.id].crystals}
                            onChange={(e) => handleChange(user.id, "crystals", e.target.value)}
                            className="w-32 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white"
                          />
                        ) : (
                          user.crystals.toLocaleString()
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                        {editMode[user.id] ? (
                          <button
                            onClick={() => handleSave(user.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
                          >
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, page * pageSize + users.length)} of{" "}
                {totalPages * pageSize} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
