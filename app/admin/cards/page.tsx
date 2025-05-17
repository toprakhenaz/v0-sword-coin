"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react"

// Kart tipi tanımı
interface Card {
  id: string
  name: string
  type: "weapon" | "armor" | "accessory" | "special"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  level: number
  bonus: string
  description: string
  imageUrl: string
}

export default function AdminCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterRarity, setFilterRarity] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  useEffect(() => {
    // Gerçek uygulamada bir API çağrısı yapılacak
    // Burada demo veriler kullanıyoruz
    const fetchCards = async () => {
      try {
        // API çağrısı simülasyonu
        setTimeout(() => {
          const demoCards: Card[] = [
            {
              id: "1",
              name: "Paslı Kılıç",
              type: "weapon",
              rarity: "common",
              level: 1,
              bonus: "+5 Güç",
              description: "Başlangıç silahı. Biraz paslı ama işini görür.",
              imageUrl: "/placeholder-dc6vs.png",
            },
            {
              id: "2",
              name: "Çelik Kılıç",
              type: "weapon",
              rarity: "uncommon",
              level: 5,
              bonus: "+15 Güç",
              description: "Dayanıklı çelikten yapılmış keskin bir kılıç.",
              imageUrl: "/steel-sword.png",
            },
            {
              id: "3",
              name: "Deri Zırh",
              type: "armor",
              rarity: "common",
              level: 1,
              bonus: "+10 Savunma",
              description: "Basit deri zırh. Minimal koruma sağlar.",
              imageUrl: "/placeholder-usj2c.png",
            },
            {
              id: "4",
              name: "Şans Kolyesi",
              type: "accessory",
              rarity: "rare",
              level: 10,
              bonus: "+5% Kritik Şans",
              description: "Kritik vuruş şansını artıran büyülü bir kolye.",
              imageUrl: "/placeholder.svg?height=100&width=100&query=magic+necklace",
            },
            {
              id: "5",
              name: "Ejderha Pençesi",
              type: "special",
              rarity: "legendary",
              level: 30,
              bonus: "+50 Güç, +10% Kritik Şans",
              description: "Efsanevi bir ejderhanın pençesinden yapılmış özel bir silah.",
              imageUrl: "/placeholder.svg?height=100&width=100&query=dragon+claw",
            },
          ]
          setCards(demoCards)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Kart yükleme hatası:", error)
        setIsLoading(false)
      }
    }

    fetchCards()
  }, [])

  // Filtreleme ve arama fonksiyonu
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || card.type === filterType
    const matchesRarity = filterRarity === "all" || card.rarity === filterRarity

    return matchesSearch && matchesType && matchesRarity
  })

  // Kart ekleme/düzenleme fonksiyonu (gerçek uygulamada API çağrısı yapılacak)
  const handleSaveCard = (card: Card) => {
    if (editingCard) {
      // Kart güncelleme
      setCards(cards.map((c) => (c.id === card.id ? card : c)))
    } else {
      // Yeni kart ekleme
      setCards([...cards, { ...card, id: Date.now().toString() }])
    }

    setShowAddModal(false)
    setEditingCard(null)
  }

  // Kart silme fonksiyonu (gerçek uygulamada API çağrısı yapılacak)
  const handleDeleteCard = (id: string) => {
    if (confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      setCards(cards.filter((card) => card.id !== id))
    }
  }

  // Kart düzenleme modalını aç
  const handleEditCard = (card: Card) => {
    setEditingCard(card)
    setShowAddModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kartlar</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kart Ekle
        </button>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-[#1a2235] rounded-xl p-4 border border-gray-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Kart ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent appearance-none pr-8"
              >
                <option value="all">Tüm Tipler</option>
                <option value="weapon">Silah</option>
                <option value="armor">Zırh</option>
                <option value="accessory">Aksesuar</option>
                <option value="special">Özel</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="pl-10 p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent appearance-none pr-8"
              >
                <option value="all">Tüm Nadirlikler</option>
                <option value="common">Sıradan</option>
                <option value="uncommon">Yaygın Olmayan</option>
                <option value="rare">Nadir</option>
                <option value="epic">Destansı</option>
                <option value="legendary">Efsanevi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kart Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-[#1a2235] rounded-xl border border-gray-800 overflow-hidden">
            <div
              className={`p-4 ${
                card.rarity === "common"
                  ? "bg-gray-700"
                  : card.rarity === "uncommon"
                    ? "bg-green-700"
                    : card.rarity === "rare"
                      ? "bg-blue-700"
                      : card.rarity === "epic"
                        ? "bg-purple-700"
                        : "bg-amber-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white">{card.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-1 bg-gray-800/50 rounded-md hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 bg-gray-800/50 rounded-md hover:bg-red-900/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">
                  {card.type === "weapon"
                    ? "Silah"
                    : card.type === "armor"
                      ? "Zırh"
                      : card.type === "accessory"
                        ? "Aksesuar"
                        : "Özel"}
                </span>
                <span className="text-xs">Seviye {card.level}</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex mb-4">
                <div className="w-20 h-20 bg-[#1e2738] rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">{card.description}</p>
                  <p className="text-sm font-medium text-amber-400">{card.bonus}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                <span
                  className={
                    card.rarity === "common"
                      ? "text-gray-400"
                      : card.rarity === "uncommon"
                        ? "text-green-400"
                        : card.rarity === "rare"
                          ? "text-blue-400"
                          : card.rarity === "epic"
                            ? "text-purple-400"
                            : "text-amber-400"
                  }
                >
                  {card.rarity === "common"
                    ? "Sıradan"
                    : card.rarity === "uncommon"
                      ? "Yaygın Olmayan"
                      : card.rarity === "rare"
                        ? "Nadir"
                        : card.rarity === "epic"
                          ? "Destansı"
                          : "Efsanevi"}
                </span>
                <span className="mx-2">•</span>
                <span>ID: {card.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="bg-[#1a2235] rounded-xl p-8 border border-gray-800 text-center">
          <p className="text-gray-400">Kart bulunamadı</p>
        </div>
      )}

      {/* Kart Ekleme/Düzenleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2235] rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingCard ? "Kartı Düzenle" : "Yeni Kart Ekle"}</h2>

            <CardForm
              initialCard={
                editingCard || {
                  id: "",
                  name: "",
                  type: "weapon",
                  rarity: "common",
                  level: 1,
                  bonus: "",
                  description: "",
                  imageUrl: "/placeholder-dc6vs.png",
                }
              }
              onSave={handleSaveCard}
              onCancel={() => {
                setShowAddModal(false)
                setEditingCard(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Kart Formu Bileşeni
function CardForm({
  initialCard,
  onSave,
  onCancel,
}: {
  initialCard: Card
  onSave: (card: Card) => void
  onCancel: () => void
}) {
  const [card, setCard] = useState<Card>(initialCard)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCard({ ...card, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(card)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
            Kart Adı
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={card.name}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-400 mb-1">
              Tip
            </label>
            <select
              id="type"
              name="type"
              value={card.type}
              onChange={handleChange}
              className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            >
              <option value="weapon">Silah</option>
              <option value="armor">Zırh</option>
              <option value="accessory">Aksesuar</option>
              <option value="special">Özel</option>
            </select>
          </div>

          <div>
            <label htmlFor="rarity" className="block text-sm font-medium text-gray-400 mb-1">
              Nadirlik
            </label>
            <select
              id="rarity"
              name="rarity"
              value={card.rarity}
              onChange={handleChange}
              className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            >
              <option value="common">Sıradan</option>
              <option value="uncommon">Yaygın Olmayan</option>
              <option value="rare">Nadir</option>
              <option value="epic">Destansı</option>
              <option value="legendary">Efsanevi</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-400 mb-1">
            Seviye
          </label>
          <input
            id="level"
            name="level"
            type="number"
            min="1"
            value={card.level}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="bonus" className="block text-sm font-medium text-gray-400 mb-1">
            Bonus
          </label>
          <input
            id="bonus"
            name="bonus"
            type="text"
            value={card.bonus}
            onChange={handleChange}
            required
            className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            placeholder="Örn: +5 Güç, +10% Kritik Şans"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            value={card.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-400 mb-1">
            Görsel URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            value={card.imageUrl}
            onChange={handleChange}
            className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
            placeholder="/placeholder-dc6vs.png"
          />
          <p className="text-xs text-gray-500 mt-1">Görsel URL'si veya placeholder kullanabilirsiniz</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800"
        >
          {initialCard.id ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </form>
  )
}
