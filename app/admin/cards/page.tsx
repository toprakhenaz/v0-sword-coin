"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import AdminSidebar from "@/components/Admin/AdminSidebar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import toast from "react-hot-toast"

export default function AdminCards() {
  const router = useRouter()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    hourly_income: 0,
    crystals: 0,
    upgrade_cost: 0,
    category: "Equipment",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push("/admin")
      } else {
        fetchCards()
      }
    }
    
    checkAuth()
  }, [router])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("id", { ascending: true })

      if (error) {
        throw error
      }

      setCards(data || [])
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast.error("Failed to load cards")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    })
  }

  const handleAddCard = () => {
    setEditingCard(null)
    setFormData({
      name: "",
      image: "",
      hourly_income: 0,
      crystals: 0,
      upgrade_cost: 0,
      category: "Equipment",
    })
    setShowModal(true)
  }

  const handleEditCard = (card: any) => {
    setEditingCard(card)
    setFormData({
      name: card.name,
      image: card.image,
      hourly_income: card.hourly_income,
      crystals: card.crystals,
      upgrade_cost: card.upgrade_cost,
      category: card.category,
    })
    setShowModal(true)
  }

  const handleDeleteCard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("cards").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast.success("Card deleted successfully")
      fetchCards()
    } catch (error) {
      console.error("Error deleting card:", error)
      toast.error("Failed to delete card")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = getSupabaseClient()
      
      if (editingCard) {
        // Update existing card
        const { error } = await supabase
          .from("cards")
          .update(formData)
          .eq("id", editingCard.id)

        if (error) throw error
        toast.success("Card updated successfully")
      } else {
        // Add new card
        const { error } = await supabase.from("cards").insert(formData)
        if (error) throw error
        toast.success("Card added successfully")
      }
      
      setShowModal(false)
      fetchCards()
    } catch (error) {
      console.error("Error saving card:", error)
      toast.error("Failed to save card")
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
          <h1 className="text-3xl font-bold">Manage Cards</h1>
          <button
            onClick={handleAddCard}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add New Card
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hourly Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Crystals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Upgrade Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={card.image || "/placeholder.svg"}
                          alt={card.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.hourly_income}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.crystals}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{card.upgrade_cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
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

      {/* Add/Edit Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingCard ? "Edit Card" : "Add New Card"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
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
                  <option value="Equipment">Equipment</option>
                  <option value="Workers">Workers</option>
                  <option value="Isekai">Isekai</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Hourly Income</label>
                <input
                  type="number"
                  name="hourly_income"
                  value={formData.hourly_income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>
              <div className="mb-4">
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Upgrade Cost</label>
                <input
                  type="number"
                  name="upgrade_cost"
                  value={formData.upgrade_cost}
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
                  {editingCard ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
