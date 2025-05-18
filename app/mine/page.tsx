"use client"

import { useState, useEffect, useRef } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import SkeletonLoading from "@/components/SkeletonMine"
import Popup from "@/components/Popup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"
import { useLeagueData } from "@/data/GeneralData"
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
  const [upgradeInProgress, setUpgradeInProgress] = useState(false)
  const { getLeagueColors, getLeagueImage } = useLeagueData()
  const colors = getLeagueColors(league)
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [isCardListScrollable, setIsCardListScrollable] = useState(false)
  const cardListRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<"level" | "income" | "cost">("level")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState<{ id: number; success: boolean } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load user items from database
  useEffect(() => {
    const loadUserItems = async () => {
      if (!userId) return

      try {
        // First, get all available items
        const { data: items, error: itemsError } = await supabase.from("items").select("*")

        if (itemsError) {
          console.error("Error fetching items:", itemsError)
          setIsLoading(false)
          return
        }

        if (!items || items.length === 0) {
          console.error("No items found")
          setIsLoading(false)
          return
        }

        // Then get user's items
        const { data: userItems, error: userItemsError } = await supabase
          .from("user_items")
          .select("*")
          .eq("user_id", userId)

        if (userItemsError) {
          console.error("Error fetching user items:", userItemsError)
        }

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

        // Sort cards by level
        Object.keys(processedCards).forEach((category) => {
          processedCards[category].sort((a, b) => b.level - a.level)
        })

        setAllCards(processedCards)
        setCardList(processedCards[activeCategory] || [])
        setTotalHourlyIncome(totalIncome)
        setIsLoading(false)

        // Select the first card by default if none is selected
        if (selectedCard === null && processedCards[activeCategory]?.length > 0) {
          setSelectedCard(processedCards[activeCategory][0].id)
        }
      } catch (error) {
        console.error("Error loading items:", error)
        setIsLoading(false)
      }
    }

    if (userId && !userLoading) {
      loadUserItems()
    }
  }, [userId, userLoading, activeCategory])

  // Check if card list is scrollable
  useEffect(() => {
    if (cardListRef.current) {
      setIsCardListScrollable(cardListRef.current.scrollHeight > cardListRef.current.clientHeight)
    }
  }, [cardList])

  // Update card list when category changes
  useEffect(() => {
    setCardList(allCards[activeCategory] || [])
    // Reset selected card when changing categories
    if (allCards[activeCategory]?.length > 0) {
      setSelectedCard(allCards[activeCategory][0].id)
    } else {
      setSelectedCard(null)
    }
    setShowCardDetails(false)
  }, [activeCategory, allCards])

  // Sort and filter cards
  useEffect(() => {
    if (allCards[activeCategory]) {
      let filteredCards = [...allCards[activeCategory]]

      // Apply search filter
      if (searchTerm) {
        filteredCards = filteredCards.filter((card) => card.name.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      // Apply sorting
      filteredCards.sort((a, b) => {
        let comparison = 0

        switch (sortOption) {
          case "level":
            comparison = a.level - b.level
            break
          case "income":
            comparison = a.hourlyIncome - b.hourlyIncome
            break
          case "cost":
            comparison = a.upgradeCost - b.upgradeCost
            break
        }

        return sortDirection === "asc" ? comparison : -comparison
      })

      setCardList(filteredCards)
    }
  }, [allCards, activeCategory, searchTerm, sortOption, sortDirection])

  // Handle upgrade animation
  useEffect(() => {
    if (upgradeSuccess) {
      const timer = setTimeout(() => {
        setUpgradeSuccess(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [upgradeSuccess])

  // Handle confetti animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const handleUpgrade = async (id: number) => {
    if (!userId || upgradeInProgress) return

    const card = cardList.find((c) => c.id === id)
    if (!card || coins < card.upgradeCost) return

    try {
      setUpgradeInProgress(true)

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
          setUpgradeInProgress(false)
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
        setUpgradeInProgress(false)
        return
      }

      // Deduct coins from user
      await updateCoins(-card.upgradeCost, "item_upgrade", `Upgraded item ${id} to level ${newLevel}`)

      // Show upgrade animation
      setShowUpgradeAnimation(true)
      setUpgradeSuccess({ id: card.id, success: true })
      setShowConfetti(true)
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
        [activeCategory]: allCards[activeCategory].map((c) =>
          c.id === id
            ? {
                ...c,
                level: newLevel,
                hourlyIncome: newHourlyIncome,
                upgradeCost: newUpgradeCost,
              }
            : c,
        ),
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
    } finally {
      setUpgradeInProgress(false)
    }
  }

  const handleCardSelect = (id: number) => {
    setSelectedCard(id)
    setShowCardDetails(true)
  }

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions)
  }

  const handleSort = (option: "level" | "income" | "cost") => {
    if (sortOption === option) {
      // Toggle direction if same option
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new option with default desc direction
      setSortOption(option)
      setSortDirection("desc")
    }
    setShowSortOptions(false)
  }

  const getSortIcon = (option: "level" | "income" | "cost") => {
    if (sortOption !== option) return null
    return sortDirection === "asc" ? (
      <FontAwesomeIcon icon={icons.chevronUp} className="ml-1 text-xs" />
    ) : (
      <FontAwesomeIcon icon={icons.chevronDown} className="ml-1 text-xs" />
    )
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
      <div className="relative h-48 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-80"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder-tdma2.png')",
            filter: "blur(2px)",
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <div className="mb-3 relative">
            <div className="absolute inset-0 rounded-full bg-black/30 blur-md transform scale-110"></div>
            <Image
              src={getLeagueImage(league) || "/placeholder.svg"}
              alt="League Sword"
              width={80}
              height={80}
              className="relative z-10 drop-shadow-lg animate-pulse"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <h1
            className="text-3xl font-bold mb-2 text-yellow-300 drop-shadow-lg relative"
            style={{ textShadow: "0 2px 10px rgba(255, 215, 0, 0.5)" }}
          >
            Macera Madeni
            <span
              className="absolute left-0 right-0 h-0.5 -bottom-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.7), transparent)",
                boxShadow: "0 0 8px rgba(255, 215, 0, 0.5)",
              }}
            ></span>
          </h1>

          {/* Total Income Display */}
          <div className="mt-3 bg-gray-800/80 rounded-full px-6 py-2 flex items-center shadow-lg border border-gray-700/50 backdrop-blur-sm">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-3 text-xl" />
            <div>
              <div className="text-xs text-gray-400">Toplam Saatlik Kazanç</div>
              <div className="text-xl font-bold text-white flex items-center">
                <span>{totalHourlyIncome.toLocaleString()}</span>
                <span className="text-gray-400 ml-1 text-sm">/saat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {/* Category Tabs */}
        <div className="mb-6">
          <BottomNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {/* Search and Sort Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 mr-2">
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            />
            <FontAwesomeIcon
              icon={icons.search}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={icons.times} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleSortOptions}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-4 text-sm flex items-center hover:bg-gray-700/50 transition-colors"
            >
              <FontAwesomeIcon icon={icons.sort} className="mr-2" />
              <span>Sırala</span>
            </button>

            {showSortOptions && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => handleSort("level")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${sortOption === "level" ? "bg-gray-700/50" : ""}`}
                >
                  <span>Seviye</span>
                  {getSortIcon("level")}
                </button>
                <button
                  onClick={() => handleSort("income")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${sortOption === "income" ? "bg-gray-700/50" : ""}`}
                >
                  <span>Kazanç</span>
                  {getSortIcon("income")}
                </button>
                <button
                  onClick={() => handleSort("cost")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${sortOption === "cost" ? "bg-gray-700/50" : ""}`}
                >
                  <span>Yükseltme Maliyeti</span>
                  {getSortIcon("cost")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Grid and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Grid - Left Side */}
          <div className="md:col-span-1">
            <div
              className="bg-gray-800/50 rounded-xl p-4 shadow-lg mb-4 border border-gray-700/50 backdrop-blur-sm"
              style={{
                background: `linear-gradient(to bottom, rgba(13, 18, 32, 0.7), rgba(17, 24, 39, 0.8))`,
                boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={icons.pickaxe}
                  className="text-yellow-400 mr-2"
                  style={{ filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))" }}
                />
                <span>{activeCategory} Koleksiyonu</span>
                <span className="ml-2 text-sm text-gray-400">({cardList.length})</span>
              </h2>

              {isCardListScrollable && (
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-1 bg-gray-700 rounded-full"></div>
                </div>
              )}

              <div
                ref={cardListRef}
                className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide"
                style={{ scrollBehavior: "smooth" }}
              >
                {cardList.length > 0 ? (
                  cardList.map((card) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 transform ${
                        selectedCard === card.id
                          ? "bg-gradient-to-r from-yellow-800/70 to-yellow-900/70 border-l-4 border-yellow-400 scale-102 shadow-lg"
                          : "bg-gray-700/50 hover:bg-gray-600/50 hover:scale-102"
                      }`}
                      onClick={() => handleCardSelect(card.id)}
                      style={{
                        boxShadow:
                          selectedCard === card.id
                            ? "0 4px 12px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 215, 0, 0.2)"
                            : "0 2px 5px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-600/50 relative flex-shrink-0 shadow-md">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute bottom-0 right-0 w-6 h-6 bg-gray-800/80 rounded-tl-lg flex items-center justify-center backdrop-blur-sm"
                            style={{
                              boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                            }}
                          >
                            <span className="text-xs font-bold text-yellow-400">{card.level}</span>
                          </div>

                          {upgradeSuccess?.id === card.id && (
                            <div className="absolute inset-0 bg-yellow-500/30 flex items-center justify-center animate-pulse">
                              <FontAwesomeIcon
                                icon={icons.angleDoubleUp}
                                className="text-yellow-300 text-xl animate-bounce"
                                style={{ filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0.5))" }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">{card.name}</h3>
                          <div className="flex items-center text-xs">
                            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                            <span className="text-yellow-300 truncate">+{card.hourlyIncome.toLocaleString()}/s</span>
                          </div>
                          <div className="flex items-center text-xs mt-1">
                            <div className="w-full bg-gray-600/50 h-1 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{
                                  width: `${Math.min(100, (card.level / 10) * 100)}%`,
                                  boxShadow: "0 0 5px rgba(255, 215, 0, 0.5)",
                                }}
                              ></div>
                            </div>
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
                  ))
                ) : searchTerm ? (
                  <div className="text-center py-8 text-gray-400">
                    <FontAwesomeIcon icon={icons.search} className="text-3xl mb-2 opacity-50" />
                    <p>"{searchTerm}" için sonuç bulunamadı</p>
                    <button onClick={() => setSearchTerm("")} className="mt-2 text-yellow-400 text-sm hover:underline">
                      Aramayı temizle
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FontAwesomeIcon icon={icons.pickaxe} className="text-3xl mb-2 opacity-50" />
                    <p>Bu kategoride henüz ekipman yok</p>
                    <p className="text-sm mt-1">Başka bir kategori seçin</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Details - Right Side */}
          <div className="md:col-span-2">
            {selectedCardDetails ? (
              <div
                className={`bg-gray-800/50 rounded-xl p-5 shadow-lg h-full border border-gray-700/50 backdrop-blur-sm transition-all duration-500 transform ${
                  showCardDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{
                  background: `linear-gradient(to bottom, rgba(13, 18, 32, 0.7), rgba(17, 24, 39, 0.8))`,
                  boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`,
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Card Header */}
                  <div
                    className="flex items-center justify-between mb-5 pb-3"
                    style={{
                      borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
                    }}
                  >
                    <h2 className="text-xl font-bold text-white flex items-center truncate">
                      {selectedCardDetails.name}
                      <span
                        className="ml-3 text-xs bg-yellow-800/70 text-yellow-300 px-2 py-0.5 rounded-full flex items-center"
                        style={{
                          boxShadow: "0 0 5px rgba(255, 215, 0, 0.2)",
                        }}
                      >
                        <FontAwesomeIcon icon={icons.star} className="mr-1 text-2xs" />
                        Lvl {selectedCardDetails.level}
                      </span>
                    </h2>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />
                      <span className="text-yellow-300 text-sm font-bold">
                        +{selectedCardDetails.hourlyIncome.toLocaleString()}/s
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-grow">
                    {/* Card Image */}
                    <div
                      className="bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded-lg p-4 flex items-center justify-center relative overflow-hidden"
                      style={{
                        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle, ${colors.secondary}30, transparent 70%)`,
                        }}
                      ></div>

                      {/* Animated background elements */}
                      {[...Array(5)].map((_, i) => {
                        const size = 3 + Math.random() * 5
                        const posX = Math.random() * 100
                        const posY = Math.random() * 100
                        const duration = 3 + Math.random() * 3
                        const delay = Math.random() * 2

                        return (
                          <div
                            key={i}
                            className="absolute rounded-full animate-pulse"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              left: `${posX}%`,
                              top: `${posY}%`,
                              background: i % 2 === 0 ? colors.primary : colors.secondary,
                              boxShadow: `0 0 5px ${colors.glow}`,
                              animationDuration: `${duration}s`,
                              animationDelay: `${delay}s`,
                              opacity: 0.3,
                            }}
                          />
                        )
                      })}

                      <div className="relative w-full h-48 md:h-56 flex items-center justify-center">
                        <img
                          src={selectedCardDetails.image || "/placeholder.svg"}
                          alt={selectedCardDetails.name}
                          className={`w-full h-full object-contain transition-all duration-500 ${
                            showUpgradeAnimation ? "scale-125 opacity-0" : "scale-100 opacity-100"
                          }`}
                          style={{
                            filter: `drop-shadow(0 0 10px ${colors.glow})`,
                          }}
                        />
                        {showUpgradeAnimation && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-4xl font-bold text-yellow-300 animate-bounce"
                              style={{
                                textShadow: "0 0 10px rgba(255, 215, 0, 0.7)",
                              }}
                            >
                              LEVEL UP!
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confetti effect */}
                      {showConfetti && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {[...Array(30)].map((_, i) => {
                            const size = 5 + Math.random() * 10
                            const startX = 50
                            const startY = 50
                            const angle = Math.random() * Math.PI * 2
                            const distance = 30 + Math.random() * 100
                            const duration = 1 + Math.random() * 2
                            const delay = Math.random() * 0.5
                            const color = [
                              "#FFD700", // Gold
                              "#FFA500", // Orange
                              "#FF4500", // Red-Orange
                              "#FF6347", // Tomato
                              "#FFFF00", // Yellow
                            ][Math.floor(Math.random() * 5)]

                            return (
                              <div
                                key={i}
                                className="absolute rounded-sm"
                                style={{
                                  width: `${size}px`,
                                  height: `${size}px`,
                                  left: `${startX}%`,
                                  top: `${startY}%`,
                                  backgroundColor: color,
                                  transform: `rotate(${Math.random() * 360}deg)`,
                                  animation: `confetti ${duration}s ease-out ${delay}s forwards`,
                                  opacity: 0,
                                }}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card Stats */}
                    <div
                      className="bg-gray-700/50 rounded-lg p-4 flex flex-col justify-between"
                      style={{
                        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Mevcut Seviye</span>
                            <span>{selectedCardDetails.level} / 10</span>
                          </div>
                          <div className="h-2.5 bg-gray-600/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(selectedCardDetails.level / 10) * 100}%`,
                                background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
                                boxShadow: `0 0 5px ${colors.glow}`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <h3 className="text-xs text-gray-400 mb-1">Saatlik Kazanç</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={icons.coins}
                              className="text-yellow-400 mr-2 text-lg"
                              style={{ filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))" }}
                            />
                            <span className="text-xl font-bold text-white">
                              {selectedCardDetails.hourlyIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <h3 className="text-xs text-gray-400 mb-1">Sonraki Seviye</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={icons.coins}
                              className="text-green-400 mr-2 text-lg"
                              style={{ filter: "drop-shadow(0 0 3px rgba(34, 197, 94, 0.5))" }}
                            />
                            <span className="text-xl font-bold text-green-400">
                              {Math.floor(selectedCardDetails.hourlyIncome * 1.5).toLocaleString()}
                            </span>
                            <span className="ml-2 text-green-500 text-xs flex items-center">
                              <FontAwesomeIcon icon={icons.angleDoubleUp} className="mr-1" />+
                              {Math.floor(selectedCardDetails.hourlyIncome * 0.5).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <h3 className="text-xs text-gray-400 mb-1">Yükseltme Maliyeti</h3>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={icons.coins}
                              className="text-yellow-400 mr-2 text-lg"
                              style={{ filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))" }}
                            />
                            <span
                              className={`text-xl font-bold ${coins >= selectedCardDetails.upgradeCost ? "text-white" : "text-red-400"}`}
                            >
                              {selectedCardDetails.upgradeCost.toLocaleString()}
                            </span>
                            {coins < selectedCardDetails.upgradeCost && (
                              <span className="ml-2 text-red-400 text-xs flex items-center">
                                <FontAwesomeIcon icon={icons.times} className="mr-1" />
                                Yetersiz
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpgrade(selectedCardDetails.id)}
                        className={`mt-4 w-full py-3 px-4 rounded-lg font-bold text-center transition-all duration-300 flex items-center justify-center
                          ${
                            coins < selectedCardDetails.upgradeCost || upgradeInProgress
                              ? "bg-gray-600/70 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 active:scale-95"
                          }`}
                        disabled={coins < selectedCardDetails.upgradeCost || upgradeInProgress}
                        style={{
                          boxShadow:
                            coins < selectedCardDetails.upgradeCost || upgradeInProgress
                              ? "none"
                              : "0 4px 12px rgba(255, 215, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {upgradeInProgress ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span>Yükseltiliyor...</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={icons.coins} className="mr-2" />
                            <span>{selectedCardDetails.upgradeCost.toLocaleString()}</span>
                            <span className="ml-2">Yükselt</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div
                    className="mt-5 bg-gray-700/50 rounded-lg p-4"
                    style={{
                      boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h3 className="font-bold mb-2 flex items-center text-sm">
                      <FontAwesomeIcon icon={icons.infoCircle} className="text-blue-400 mr-2" />
                      Ekipman Bilgisi
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {selectedCardDetails.description ||
                        `${selectedCardDetails.name} seviye ${selectedCardDetails.level} ekipmanı saatte ${selectedCardDetails.hourlyIncome.toLocaleString()} coin kazandırır.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="bg-gray-800/50 rounded-xl p-5 shadow-lg h-full flex flex-col items-center justify-center text-center border border-gray-700/50 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(to bottom, rgba(13, 18, 32, 0.7), rgba(17, 24, 39, 0.8))`,
                  boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`,
                }}
              >
                <div className="w-24 h-24 mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-gray-700/50 animate-pulse"></div>
                  <Image
                    src={getLeagueImage(league) || "/placeholder.svg"}
                    alt="Sword"
                    width={96}
                    height={96}
                    className="object-contain relative z-10"
                    style={{ filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))" }}
                  />
                </div>
                <h2 className="text-2xl font-bold mb-3">Ekipman Seçin</h2>
                <p className="text-gray-400 mb-6 text-sm max-w-md">
                  Macera madeninde ilerlemek için sol taraftan bir ekipman seçin ve yükseltin.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category)
                        if (allCards[category] && allCards[category].length > 0) {
                          setSelectedCard(allCards[category][0].id)
                          setShowCardDetails(true)
                        }
                      }}
                      className="bg-gray-700/50 hover:bg-gray-600/50 rounded-lg p-4 transition-all duration-300 flex flex-col items-center transform hover:scale-105 active:scale-95"
                      style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
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
                        className="text-yellow-400 text-2xl mb-2"
                        style={{ filter: "drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))" }}
                      />
                      <span className="text-sm font-medium">{category}</span>
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

      {/* Custom CSS for confetti animation */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(${() => (Math.random() * 200) - 100}px, ${() => (Math.random() * 200) - 50}px) rotate(${() => Math.random() * 360}deg);
            opacity: 0;
          }
        }
        .scale-102 {
          transform: scale(1.02);
        }
        .text-2xs {
          font-size: 0.625rem;
        }
      `}</style>
    </main>
  )
}
