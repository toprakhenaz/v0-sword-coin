"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import Card from "@/components/Card"
import TimeBar from "@/components/TimeBar"
import { useUser } from "@/app/context/UserContext"
import SkeletonLoading from "@/components/skeletons/SkeletonMine"
import { createClient } from "@/lib/supabase/client"

export default function MinePage() {
  const { user, loading, addCoins } = useUser()
  const [activeCategory, setActiveCategory] = useState("Equipment")
  const [cards, setCards] = useState([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [dailyCombo, setDailyCombo] = useState([1, 2, 3])
  const [foundCards, setFoundCards] = useState([1])
  const supabase = createClient()

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) return

      try {
        const { data: userCards, error: userCardsError } = await supabase
          .from("user_cards")
          .select("*, card:cards(*)")
          .eq("user_id", user.id)
          .order("id")

        if (userCardsError) throw userCardsError

        // Group cards by category
        const groupedCards = userCards.reduce((acc, userCard) => {
          const category = userCard.card.category
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push({
            id: userCard.card.id,
            name: userCard.card.name,
            image: userCard.card.image_url,
            level: userCard.level,
            hourlyIncome: userCard.card.base_income * Math.pow(userCard.card.level_multiplier, userCard.level - 1),
            upgradeCost: Math.floor(
              userCard.card.upgrade_cost * Math.pow(userCard.card.level_multiplier, userCard.level),
            ),
          })
          return acc
        }, {})

        setCards(groupedCards)
      } catch (error) {
        console.error("Error fetching cards:", error)
      } finally {
        setLoadingCards(false)
      }
    }

    if (user) {
      fetchCards()
    }
  }, [user, supabase])

  const handleUpgrade = async (cardId) => {
    if (!user) return

    try {
      // Find the card in the cards object
      let foundCard = null
      let foundCategory = null

      Object.entries(cards).forEach(([category, categoryCards]) => {
        categoryCards.forEach((card) => {
          if (card.id === cardId) {
            foundCard = card
            foundCategory = category
          }
        })
      })

      if (!foundCard || !foundCategory) return

      if (user.coins < foundCard.upgradeCost) return

      // Update the card level in the database
      const { error: updateError } = await supabase
        .from("user_cards")
        .update({ level: foundCard.level + 1 })
        .eq("user_id", user.id)
        .eq("card_id", cardId)

      if (updateError) throw updateError

      // Update the user's coins
      await addCoins(-foundCard.upgradeCost)

      // Update the local state
      setCards((prevCards) => {
        const newCards = { ...prevCards }
        newCards[foundCategory] = newCards[foundCategory].map((card) => {
          if (card.id === cardId) {
            return {
              ...card,
              level: card.level + 1,
              hourlyIncome: card.hourlyIncome * 1.5, // Assuming 1.5x multiplier per level
              upgradeCost: Math.floor(card.upgradeCost * 1.5), // Assuming 1.5x cost increase per level
            }
          }
          return card
        })
        return newCards
      })
    } catch (error) {
      console.error("Error upgrading card:", error)
    }
  }

  if (loading || !user || loadingCards) {
    return <SkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <HeaderCard />

      <TimeBar dailyCombo={dailyCombo} foundCards={foundCards} />

      <div className="my-4">
        <BottomNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pb-20">
        {cards[activeCategory]?.map((card) => (
          <Card key={card.id} card={card} onUpgrade={handleUpgrade} coins={user.coins} />
        ))}
      </div>

      <Navbar />
    </main>
  )
}
