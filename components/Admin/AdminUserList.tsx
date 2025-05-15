"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"
import AdminUserModal from "./AdminUserModal"

export default function AdminUserList() {
  const { supabase } = useSupabase()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  const fetchUsers = async () => {
    if (!supabase) return

    try {
      setLoading(true)

      // Toplam sayıyı al
      const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

      if (countError) {
        throw countError
      }

      setTotalPages(Math.ceil((count || 0) / pageSize))

      // Kullanıcıları sayfalama ile al
      let query = supabase
        .from("users")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("id", { ascending: true })

      // Arama filtresi uygula
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

  const handleEdit = (user: any) => {
    setCurrentUser(user)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setCurrentUser(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!supabase) return

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleSave = async (userData: any) => {
    if (!supabase) return

    try {
      if (userData.id) {
        // Mevcut kullanıcıyı güncelle
        const { error } = await supabase.from("users").update(userData).eq("id", userData.id)

        if (error) {
          throw error
        }

        toast.success("User updated successfully")
      } else {
        // Yeni kullanıcı oluştur
        const { error } = await supabase.from("users").insert(userData)

        if (error) {
          throw error
        }

        toast.success("User created successfully")
      }

      setIsModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Failed to save user")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add User
        </button>
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
                      Coins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      League
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Login
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
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.coins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.league}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                        <button onClick={() => handleEdit(user)} className="text-blue-400 hover:text-blue-300 mr-3">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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

      {isModalOpen && <AdminUserModal user={currentUser} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}
