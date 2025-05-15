"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/providers/UserProvider"
import { Cards } from "@/data/cardData"
import { SkeletonMine } from "@/components/Skeleton/SkeletonMine"
import { CardList } from "@/components/Mine/CardList"
import { CardDetails } from "@/components/Mine/CardDetails"
import { Navbar } from "@/components/Navbar"

export default function MinePage() {
  const { user, loading } = useUser()
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [userCards, setUserCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Mock kullanıcı kartları
      const mockUserCards = [
        { id: 1, userId: user.id, cardId: 1, level: 2 },
        { id: 2, userId: user.id, cardId: 3, level: 1 },
        { id: 3, userId: user.id, cardId: 5, level: 3 },
      ]

      setUserCards(mockUserCards)
      setIsLoading(false)
    }
  }, [user])

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
  }

  const handleCloseDetails = () => {
    setSelectedCard(null)
  }

  const handleUpgradeCard = async (cardId: number, newLevel: number) => {
    // Mock kart yükseltme işlemi
    setUserCards((prev) => prev.map((card) => (card.cardId === cardId ? { ...card, level: newLevel } : card)))

    // Kullanıcı verilerini güncelle (örneğin, coin azaltma)
    // Bu kısım gerçek uygulamada API çağrısı yapacak
  }

  if (loading || isLoading) {
    return <SkeletonMine />
  }

  const selectedCardData = selectedCard ? Cards.find((card) => card.id === selectedCard) : null

  const userCardData = selectedCard ? userCards.find((card) => card.cardId === selectedCard) : null

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Kart Koleksiyonu</h1>

        <CardList cards={Cards} userCards={userCards} onSelectCard={handleCardSelect} />

        {selectedCard && selectedCardData && userCardData && (
          <CardDetails
            card={selectedCardData}
            userCard={userCardData}
            onClose={handleCloseDetails}
            onUpgrade={handleUpgradeCard}
            userCoins={user?.coins || 0}
            userCrystals={user?.crystals || 0}
          />
        )}
      </div>

      <Navbar />
    </div>
  )
}
