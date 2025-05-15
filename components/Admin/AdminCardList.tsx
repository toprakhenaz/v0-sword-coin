"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons"
import AdminCardModal from "./AdminCardModal"
import Image from "next/image"

export default function AdminCardList() {
  const { supabase } = useSupabase()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  const fetchCards = async () => {
    if (!supabase) return

    try {
      setLoading(true)

      let query = supabase.from("cards").select("*").order("id", { ascending: true })

      // Arama filtresi uygula
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      // Kategori filtresi uygula
      if (categoryFilter) {
        query = query.eq("categoryId", categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setCards(data || [])

      // Kategorileri al
      const { data: categoryData, error: categoryError } = await supabase
        .from("card_categories")
        .select("*")
        .order("name", { ascending: true })

      if (categoryError) {
        throw categoryError
      }

      setCategories((categoryData || []).map((cat) => cat.name))
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast.error("Failed to load cards")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [supabase, searchTerm, categoryFilter])

  const handleEdit = (card: any) => {
    setCurrentCard(card)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setCurrentCard(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!supabase) return

    if (!window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      return
    }

    try {
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

  const handleSave = async (cardData: any) => {
    if (!supabase) return

    try {
      if (cardData.id) {
        // Mevcut kartı güncelle
        const { error } = await supabase.from("cards").update(cardData).eq("id", cardData.id)

        if (error) {
          throw error
        }

        toast.success("Card updated successfully")
      } else {
        // Yeni kart oluştur
        const { error } = await supabase.from("cards").insert(cardData)

        if (error) {
          throw error
        }

        toast.success("Card created successfully")
      }

      setIsModalOpen(false)
      fetchCards()
    } catch (error) {
      console.error("Error saving card:", error)
      toast.error("Failed to save card")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cards</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Card
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
              placeholder="Search cards..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 relative">
                  <Image src={card.image || "/placeholder.png"} alt={card.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{card.name}</h3>
                      <p className="text-sm text-gray-400">{card.category}</p>
                    </div>
                    <div className="flex">
                      <button onClick={() => handleEdit(card)} className="text-blue-400 hover:text-blue-300 mr-2">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleDelete(card.id)} className="text-red-400 hover:text-red-300">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Hourly:</span> {card.hourlyIncome}
                    </div>
                    <div>
                      <span className="text-gray-400">Crystals:</span> {card.crystals}
                    </div>
                    <div>
                      <span className="text-gray-400">Upgrade:</span> {card.upgradeCost}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <AdminCardModal
          card={currentCard}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          categories={categories}
        />
      )}
    </div>
  )
}
