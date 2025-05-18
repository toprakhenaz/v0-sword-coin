"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import SkeletonLoading from "@/components/SkeletonMine"
import Popup from "@/components/Popup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"
import { useLeagueData } from "@/data/GeneralData"
import { Progress } from "@/components/Progress"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserContext"
import BottomNav from "@/components/BottomNav"

interface CardItem {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  upgradeCost: number
  description: string
  category: string
  userItemId?: string // Reference to user_items table
}

export default function MinePage() {
  const { userId, coins, hourlyEarn, league, isLoading: userLoading, updateCoins, refreshUserData } = useUser()

  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Ekipman")
  const [cardList, setCardList] = useState<CardItem[]>([])
  const [allCards, setAllCards] = useState<Record<string, CardItem[]>>({
    Ekipman: [],
    İşçiler: [],
    Isekai: [],
    Özel: [],
  })
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    image: "",
  })
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [totalHourlyIncome, setTotalHourlyIncome] = useState(0)
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false)
  const { getLeagueColors, getLeagueImage } = useLeagueData()
  const colors = getLeagueColors(league)

  // Load user items from database
  useEffect(() => {
    const loadUserItems = async () => {
      if (!userId) return

      try {
        // First, get all available items
        const { data: items } = await supabase.from("items").select("*")

        if (!items) {
          console.error("No items found")
          setIsLoading(false)
          return
        }

        // Then get user's items
        const { data: userItems } = await supabase.from("user_items").select("*").eq("user_id", userId)

        // Create a map of user items for quick lookup
        const userItemsMap = new Map()
        if (userItems) {
          userItems.forEach((userItem) => {
            userItemsMap.set(userItem.item_id, userItem)
          })
        }

        // Process items into categories
        const processedCards: Record<string, CardItem[]> = {
          Ekipman: [],
          İşçiler: [],
          Isekai: [],
          Özel: [],
        }

        let totalIncome = 0

        items.forEach((item) => {
          const userItem = userItemsMap.get(item.id)

          const cardItem: CardItem = {
            id: item.id,
            name: item.name,
            image: item.image,
            category: item.category,
            description: item.description,
            level: userItem ? userItem.level : 1,
            hourlyIncome: userItem ? userItem.hourly_income : item.base_hourly_income,
            upgradeCost: userItem ? userItem.upgrade_cost : item.base_upgrade_cost,
            userItemId: userItem ? userItem.id : undefined,
          }

          if (processedCards[item.category]) {
            processedCards[item.category].push(cardItem)
          }

          // If user owns this item, add to total income
          if (userItem) {
            totalIncome += userItem.hourly_income
          }
        })

        setAllCards(processedCards)
        setCardList(processedCards[activeCategory] || [])
        setTotalHourlyIncome(totalIncome)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading items:", error)
        setIsLoading(false)
      }
    }

    if (userId && !userLoading) {
      loadUserItems()
    }
  }, [userId, userLoading, activeCategory])

  // Update card list when category changes
  useEffect(() => {
    setCardList(allCards[activeCategory] || [])
  }, [activeCategory, allCards])

  const handleUpgrade = async (id: number) => {
    if (!userId) return

    const card = cardList.find((c) => c.id === id)
    if (!card || coins < card.upgradeCost) return

    try {
      // If user doesn't own this item yet, create it
      if (!card.userItemId) {
        const { data: newUserItem, error: insertError } = await supabase
          .from("user_items")
          .insert([
            {
              user_id: userId,
              item_id: card.id,
              level: 1,
              hourly_income: card.hourlyIncome,
              upgrade_cost: card.upgradeCost,
            },
          ])
          .select()
          .single()

        if (insertError) {
          console.error("Error creating user item:", insertError)
          return
        }

        card.userItemId = newUserItem.id
      }

      // Calculate new values
      const newLevel = card.level + 1
      const newHourlyIncome = Math.floor(card.hourlyIncome * 1.5)
      const newUpgradeCost = Math.floor(card.upgradeCost * 2)

      // Update user item in database
      const { error: updateError } = await supabase
        .from("user_items")
        .update({
          level: newLevel,
          hourly_income: newHourlyIncome,
          upgrade_cost: newUpgradeCost,
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.userItemId)

      if (updateError) {
        console.error("Error upgrading item:", updateError)
        return
      }

      // Deduct coins from user
      await updateCoins(-card.upgradeCost, "item_upgrade", `Upgraded item ${id} to level ${newLevel}`)

      // Show upgrade animation
      setShowUpgradeAnimation(true)
      setTimeout(() => setShowUpgradeAnimation(false), 1500)

      // Update card in local state
      const updatedCardList = cardList.map((c) =>
        c.id === id
          ? {
              ...c,
              level: newLevel,
              hourlyIncome: newHourlyIncome,
              upgradeCost: newUpgradeCost,
            }
          : c,
      )
      setCardList(updatedCardList)

      // Update all cards state
      setAllCards({
        ...allCards,
        [activeCategory]: updatedCardList,
      })

      // Recalculate total hourly income
      const newTotalIncome = Object.values(allCards)
        .flat()
        .reduce((total, item) => {
          if (item.id === id) {
            return total + newHourlyIncome
          }
          return total + item.hourlyIncome
        }, 0)

      setTotalHourlyIncome(newTotalIncome)

      // Update user's hourly earn in database
      await supabase
        .from("users")
        .update({
          hourly_earn: newTotalIncome,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Refresh user data in context
      await refreshUserData()

      // Show success popup
      setPopupData({
        title: "Yükseltme Başarılı!",
        message: `${card.name} seviye ${newLevel} oldu!`,
        image: card.image,
      })
      setShowPopup(true)
    } catch (error) {
      console.error("Error upgrading item:", error)
    }
  }

  const handleCardSelect = (id: number) => {
    setSelectedCard(id === selectedCard ? null : id)
  }

  const categories = ["Ekipman", "İşçiler", "Isekai", "Özel"]

  if (isLoading || userLoading) {
    return <SkeletonLoading />
  }

  // Find the selected card details
  const selectedCardDetails = selectedCard ? cardList.find((card) => card.id === selectedCard) : null

  return (
    <main className="min-h-screen bg-[#0d1220] text-white pb-24">
      <HeaderCard coins={coins} hourlyEarn={hourlyEarn} />

      {/* Hero Banner */}
      <div className="relative h-40 mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-80"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/placeholder-tdma2.png')" }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <div className="mb-2">
            <Image
              src={getLeagueImage(league) || "/placeholder.svg"}
              alt="League Sword"
              width={60}
              height={60}
              className="mx-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-yellow-300 drop-shadow-lg">Macera Madeni</h1>

          {/* Total Income Display */}
          <div className="mt-2 bg-gray-800 bg-opacity-80 rounded-full px-5 py-1.5 flex items-center shadow-lg border border-gray-700">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
            <span className="text-xl font-bold text-white">{totalHourlyIncome.toLocaleString()}</span>
            <span className="text-gray-400 ml-1 text-sm">/saat</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {/* Category Tabs */}
        <div className="mb-4">
          <BottomNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {/* Card Grid and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Grid - Left Side */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-xl p-3 shadow-lg mb-4">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <FontAwesomeIcon icon={icons.pickaxe} className="text-yellow-400 mr-2" />
                {activeCategory} Koleksiyonu
              </h2>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                {cardList.map((card) => (
                  <div
                    key={card.id}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedCard === card.id
                        ? "bg-gradient-to-r from-yellow-800 to-yellow-900 border-l-4 border-yellow-400"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleCardSelect(card.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 bg-gray-600 relative flex-shrink-0">
                        <img
                          src={card.image || "/placeholder.svg"}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-gray-800 rounded-tl-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-400">{card.level}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{card.name}</h3>
                        <div className="flex items-center text-xs">
                          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                          <span className="text-yellow-300 truncate">+{card.hourlyIncome.toLocaleString()}/s</span>
                        </div>
                      </div>
                      <FontAwesomeIcon
                        icon={icons.chevronRight}
                        className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ml-1 ${
                          selectedCard === card.id ? "transform rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Details - Right Side */}
          <div className="md:col-span-2">
            {selectedCardDetails ? (
              <div className="bg-gray-800 rounded-xl p-4 shadow-lg h-full">
                <div className="flex flex-col h-full">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center truncate">
                      {selectedCardDetails.name}
                      <span className="ml-2 text-xs bg-yellow-800 text-yellow-300 px-2 py-0.5 rounded-full">
                        Lvl {selectedCardDetails.level}
                      </span>
                    </h2>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />
                      <span className="text-yellow-300 text-sm">
                        +{selectedCardDetails.hourlyIncome.toLocaleString()}/s
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow">
                    {/* Card Image */}
                    <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg p-3 flex items-center justify-center relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle, ${colors.secondary}30, transparent 70%)`,
                        }}
                      ></div>
                      <div className="relative w-full h-40 md:h-48 flex items-center justify-center">
                        <img
                          src={selectedCardDetails.image || "/placeholder.svg"}
                          alt={selectedCardDetails.name}
                          className={`w-full h-full object-contain transition-all duration-500 ${showUpgradeAnimation ? "scale-125 opacity-0" : "scale-100 opacity-100"}`}
                        />
                        {showUpgradeAnimation && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-3xl font-bold text-yellow-300 animate-bounce">LEVEL UP!</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Stats */}
                    <div className="bg-gray-700 rounded-lg p-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Mevcut Seviye</span>
                            <span>{selectedCardDetails.level} / 10</span>
                          </div>
                          <Progress value={(selectedCardDetails.level / 10) * 100} className="h-2 bg-gray-600" />
                        </div>

                        <div>
                          <h3 className="text-xs text-gray-400 mb-1">Saatlik Kazanç</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
                            <span className="text-lg font-bold text-white">
                              {selectedCardDetails.hourlyIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs text-gray-400 mb-1">Sonraki Seviye</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={icons.coins} className="text-green-400 mr-2" />
                            <span className="text-lg font-bold text-green-400">
                              {Math.floor(selectedCardDetails.hourlyIncome * 1.5).toLocaleString()}
                            </span>
                            <span className="ml-2 text-green-500 text-xs">
                              (+{Math.floor(selectedCardDetails.hourlyIncome * 0.5).toLocaleString()})
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs text-gray-400 mb-1">Yükseltme Maliyeti</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
                            <span
                              className={`text-lg font-bold ${coins >= selectedCardDetails.upgradeCost ? "text-white" : "text-red-400"}`}
                            >
                              {selectedCardDetails.upgradeCost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpgrade(selectedCardDetails.id)}
                        className={`mt-3 w-full py-2 px-4 rounded-lg font-bold text-center transition-all duration-300 flex items-center justify-center
                          ${
                            coins < selectedCardDetails.upgradeCost
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-500 hover:to-yellow-600"
                          }`}
                        disabled={coins < selectedCardDetails.upgradeCost}
                      >
                        <FontAwesomeIcon icon={icons.coins} className="mr-2" />
                        <span>{selectedCardDetails.upgradeCost.toLocaleString()}</span>
                        <span className="ml-2">Yükselt</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div className="mt-3 bg-gray-700 rounded-lg p-3">
                    <h3 className="font-bold mb-1 flex items-center text-sm">
                      <FontAwesomeIcon icon={icons.infoCircle} className="text-blue-400 mr-2" />
                      Ekipman Bilgisi
                    </h3>
                    <p className="text-gray-300 text-xs">
                      {selectedCardDetails.description ||
                        `${selectedCardDetails.name} seviye ${selectedCardDetails.level} ekipmanı saatte ${selectedCardDetails.hourlyIncome.toLocaleString()} coin kazandırır.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-4 shadow-lg h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 mb-3">
                  <Image
                    src={getLeagueImage(league) || "/placeholder.svg"}
                    alt="Sword"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold mb-2">Ekipman Seçin</h2>
                <p className="text-gray-400 mb-4 text-sm max-w-md">
                  Macera madeninde ilerlemek için sol taraftan bir ekipman seçin ve yükseltin.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category)
                        if (allCards[category] && allCards[category].length > 0) {
                          setSelectedCard(allCards[category][0].id)
                        }
                      }}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-all duration-300 flex flex-col items-center"
                    >
                      <FontAwesomeIcon
                        icon={
                          category === "Ekipman"
                            ? icons.pickaxe
                            : category === "İşçiler"
                              ? icons.userGroup
                              : category === "Isekai"
                                ? icons.swords
                                : icons.star
                        }
                        className="text-yellow-400 text-xl mb-1"
                      />
                      <span className="text-sm">{category}</span>
                      <span className="text-xs text-gray-400 mt-1">{allCards[category]?.length || 0} adet</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          image={popupData.image}
          onClose={() => setShowPopup(false)}
        />
      )}

      <Navbar />
    </main>
  )
}
