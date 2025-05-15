"use client"

import { useState } from "react"
import { CardItem } from "./CardItem"

interface Card {
  id: number
  name: string
  image: string
  crystals: number
  level?: number
  upgradeCost: number
  categoryId: number
}

interface UserCard {
  id: number
  userId: number
  cardId: number
  level: number
}

interface CardListProps {
  cards: Card[]
  userCards: UserCard[]
  onSelectCard: (cardId: number) => void
}

export const CardList = ({ cards, userCards, onSelectCard }: CardListProps) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  // Kart kategorilerini al
  const categories = Array.from(new Set(cards.map((card) => card.categoryId)))

  // Filtrelenmiş kartları al
  const filteredCards = activeCategory ? cards.filter((card) => card.categoryId === activeCategory) : cards

  return (
    <div>
      {/* Kategori filtreleri */}
      <div className="flex overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        <button
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            activeCategory === null ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveCategory(null)}
        >
          Tümü
        </button>

        {categories.map((categoryId) => (
          <button
            key={categoryId}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeCategory === categoryId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveCategory(categoryId)}
          >
            {getCategoryName(categoryId)}
          </button>
        ))}
      </div>

      {/* Kart listesi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const userCard = userCards.find((uc) => uc.cardId === card.id)
          const level = userCard ? userCard.level : 0

          return (
            <CardItem
              key={card.id}
              id={card.id}
              name={card.name}
              image={card.image}
              level={level}
              crystals={card.crystals * (level > 0 ? level : 1)}
              onClick={() => onSelectCard(card.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

// Kategori adını döndüren yardımcı fonksiyon
function getCategoryName(categoryId: number): string {
  switch (categoryId) {
    case 1:
      return "Silahlar"
    case 2:
      return "Karakterler"
    case 3:
      return "Canavarlar"
    default:
      return "Diğer"
  }
}
