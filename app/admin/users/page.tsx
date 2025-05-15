"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import AdminSidebar from "@/components/Admin/AdminSidebar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faBan, faUnlock, faCoins, faDiamond } from "@fortawesome/free-solid-svg-icons"
import toast from "react-hot-toast"

export default function AdminUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"edit" | "ban" | "coins" | "crystals">("edit")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    coins: 0,
    energy: 0,
    energy_max: 0,
    league: 0,
    crystals: 0,
    coins_per_tap: 0,
    is_banned: false,
    ban_reason: "",
    amount: 0,
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const pageSize = 10

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push("/admin")
      } else {
        fetchUsers()
      }
    }
    
    checkAuth()
  }, [router, page, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      // Get total count for pagination
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .ilike("username", `%${searchTerm}%`)
      
      setTotalPages(Math.ceil((count || 0) / pageSize))
      
      // Get paginated users
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${searchTerm}%`)
        .order("id", { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    })
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setModalType("edit")
    setFormData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name || "",
      coins: user.coins,
      energy: user.energy,
      energy_max: user.energy_max,
      league: user.league,
      crystals: user.crystals,
      coins_per_tap: user.coins_per_tap,
      is_banned: false,
      ban_reason: "",
      amount: 0,
    })
    setShowModal(true)
  }

  const handleBanUser = (user: any) => {
    setEditingUser(user)
    setModalType("ban")
    setFormData({
      ...formData,
      is_banned: false,
      ban_reason: "",
    })
    setShowModal(true)
  }

  const handleModifyCoins = (user: any) => {
    setEditingUser(user)
    setModalType("coins")
    setFormData({
      ...formData,
      amount: 0,
    })
    setShowModal(true)
  }

  const handleModifyCrystals = (user: any) => {
    setEditingUser(user)
    setModalType("crystals")
    setFormData({
      ...formData,
      amount: 0,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = getSupabaseClient()
      
      if (modalType === "edit") {
        // Update user details
        const { error } = await supabase
          .from("users")
          .update({
            username: formData.username,
            first_name: formData.first_name,
            last_name: formData.last_name,
            coins: formData.coins,
            energy: formData.energy,
            energy_max: formData.energy_max,
            league: formData.league,
            crystals: formData.crystals,
            coins_per_tap: formData.coins_per_tap,
          })
          .eq("id", editingUser.id)

        if (error) throw error
        toast.success("User updated successfully")
      } else if (modalType === "ban") {
        // Ban/unban user logic would go here
        // For now, just show a toast
        toast.success(formData.is_banned ? "User banned successfully" : "User unbanned successfully")
      } else if (modalType === "coins") {
        // Modify coins
        const { error } = await supabase
          .from("users")
          .update({
            coins: editingUser.coins + formData.amount,
          })
          .eq("id", editingUser.id)

        if (error) throw error
        toast.success(`${formData.amount >= 0 ? "Added" : "Removed"} ${Math.abs(formData.amount)} coins`)
      } else if (modalType === "crystals") {
        // Modify crystals
        const { error } = await supabase
          .from("users")
          .update({
            crystals: editingUser.crystals + formData.amount,
          })
          .eq("id", editingUser.id)

        if (error) throw error
        toast.success(`${formData.amount >= 0 ? "Added" : "Removed"} ${Math.abs(formData.amount)} crystals`)
      }
      
      setShowModal(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    }
  }

  const renderModalContent = () => {
    switch (modalType) {
      case "edit":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Coins</label>
                  <input
                    type="number"
                    name="coins"
                    value={formData.coins}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Crystals</label>
                  <input
                    type="number"
                    name="crystals"
                    value={formData.crystals}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Energy</label>
                  <input
                    type="number"
                    name="energy"
                    value={formData.energy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Energy</label>
                  <input
                    type="number"
                    name="energy_max"
                    value={formData.energy_max}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">League</label>
                  <input
                    type="number"
                    name="league"
                    value={formData.league}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Coins Per Tap</label>
                  <input
                    type="number"
                    name="coins_per_tap"
                    value={formData.coins_per_tap}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>
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
                  Update
                </button>
              </div>
            </form>
          </>
        )
      case "ban":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{formData.is_banned ? "Ban User" : "Unban User"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_banned"
                    checked={formData.is_banned}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-300">Ban this user</span>
                </label>
              </div>
              {formData.is_banned && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                  <textarea
                    name="ban_reason"
                    value={formData.ban_reason}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={3}
                    required={formData.is_banned}
                  />
                </div>
              )}
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
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
                >
                  {formData.is_banned ? "Ban User" : "Unban User"}
                </button>
              </div>
            </form>
          </>
        )
      case "coins":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Modify Coins</h2>
            <p className="mb-4">
              Current coins: <span className="font-bold">{editingUser?.coins.toLocaleString()}</span>
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Amount (use negative value to subtract)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
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
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
                >
                  {formData.amount >= 0 ? "Add Coins" : "Remove Coins"}
                </button>
              </div>
            </form>
          </>
        )
      case "crystals":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Modify Crystals</h2>
            <p className="mb-4">
              Current crystals: <span className="font-bold">{editingUser?.crystals.toLocaleString()}</span>
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Amount (use negative value to subtract)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500"
                >
                  {formData.amount >= 0 ? "Add Crystals" : "Remove Crystals"}
                </button>
              </div>
            </form>
          </>
        )
      default:
        return null
    }
  }

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <div className="w-64">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Crystals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">League</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.coins.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.crystals}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.league}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.last_login).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 mr-2"
                        title="Edit User"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleBanUser(user)}
                        className="text-red-400 hover:text-red-300 mr-2"
                        title="Ban/Unban User"
                      >
                        <FontAwesomeIcon icon={user.is_banned ? faUnlock : faBan} />
                      </button>
                      <button
                        onClick={() => handleModifyCoins(user)}
                        className="text-yellow-400 hover:text-yellow-300 mr-2"
                        title="Modify Coins"
                      >
                        <FontAwesomeIcon icon={faCoins} />
                      </button>
                      <button
                        onClick={() => handleModifyCrystals(user)}
                        className="text-purple-400 hover:text-purple-300"
                        title="Modify Crystals"
                      >
                        <FontAwesomeIcon icon={faDiamond} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50 mr-2"
                >
                  Previous
                </button>
                <span className="text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-700 text-white disabled:opacity-50 ml-2"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  )
}
