"use client"

import { useState } from "react"
import CoinBalance from "@/components/coin-balance"
import { Sword, Shield, Coins, Zap, Clock, ChevronUp, ChevronDown } from "lucide-react"

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState("cards")
  const [expandedCard, setExpandedCard] = useState(null)
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false)
  const [purchasedItem, setPurchasedItem] = useState(null)

  const cards = [
    {
      id: 1,
      name: "Sword",
      icon: <Sword className="w-8 h-8 text-red-400" />,
      level: 3,
      nextLevelCost: 5000,
      currentBonus: "+300/hour",
      nextBonus: "+450/hour",
      color: "from-red-800 to-red-600",
      description: "Your primary mining tool. Increases coin generation with each tap.",
      stats: [
        { name: "Base Power", value: "300" },
        { name: "Critical Hit", value: "5%" },
        { name: "Durability", value: "High" },
      ],
    },
    {
      id: 2,
      name: "Shield",
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      level: 6,
      nextLevelCost: 12000,
      currentBonus: "+500/hour",
      nextBonus: "+750/hour",
      color: "from-blue-800 to-blue-600",
      description: "Protects your mining operation and generates passive income.",
      stats: [
        { name: "Defense", value: "500" },
        { name: "Reflection", value: "10%" },
        { name: "Durability", value: "Very High" },
      ],
    },
    {
      id: 3,
      name: "Helmet",
      icon: (
        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L4 8V16L12 22L20 16V8L12 2Z"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      level: 2,
      nextLevelCost: 8000,
      currentBonus: "+200/hour",
      nextBonus: "+350/hour",
      color: "from-purple-800 to-purple-600",
      description: "Enhances your mining focus and increases passive income.",
      stats: [
        { name: "Focus", value: "200" },
        { name: "Energy Save", value: "3%" },
        { name: "Durability", value: "Medium" },
      ],
    },
    {
      id: 4,
      name: "Boots",
      icon: (
        <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 2V6M16 10V6M16 6H12M22 14C22 14 19.5 16 16 16H3C3 13 4 8 11 8C15 8 17 10 17 12C17 14 15 16 15 16"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 16V22H16V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      level: 1,
      nextLevelCost: 3000,
      currentBonus: "+100/hour",
      nextBonus: "+200/hour",
      color: "from-green-800 to-green-600",
      description: "Increases your mining mobility and passive income.",
      stats: [
        { name: "Speed", value: "100" },
        { name: "Stamina", value: "2%" },
        { name: "Durability", value: "Low" },
      ],
    },
  ]

  const boosts = [
    {
      id: 1,
      name: "2x Income",
      description: "Double your income for 5 minutes",
      cost: 5000,
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      color: "from-yellow-600 to-amber-700",
    },
    {
      id: 2,
      name: "5x Tap",
      description: "Each tap counts as 5 taps for 1 minute",
      cost: 10000,
      icon: (
        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 5H16M8 5V19M8 5L4 9M16 5V19M16 5L20 9M16 19H8M16 19L20 15M8 19L4 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "from-purple-600 to-purple-800",
    },
    {
      id: 3,
      name: "+1h Offline",
      description: "Increase offline earnings time by 1 hour",
      cost: 15000,
      icon: <Clock className="w-8 h-8 text-blue-400" />,
      color: "from-blue-600 to-blue-800",
    },
  ]

  const toggleCardExpand = (id) => {
    if (expandedCard === id) {
      setExpandedCard(null)
    } else {
      setExpandedCard(id)
    }
  }

  const purchaseItem = (item) => {
    setPurchasedItem(item)
    setShowPurchaseAnimation(true)

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30])
    }

    setTimeout(() => {
      setShowPurchaseAnimation(false)
    }, 1500)
  }

  return (
    <div className="pb-4">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Shop</h1>
        <p className="text-gray-400 text-xs">Upgrade your mining power</p>
      </div>

      <CoinBalance />

      {/* Tabs */}
      <div className="flex mx-4 mb-4">
        <button
          className={`flex-1 py-2 rounded-l-lg ${
            activeTab === "cards" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("cards")}
        >
          <div className="flex items-center justify-center">
            <Sword className="w-4 h-4 mr-1" />
            Cards
          </div>
        </button>
        <button
          className={`flex-1 py-2 rounded-r-lg ${
            activeTab === "boosts" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("boosts")}
        >
          <div className="flex items-center justify-center">
            <Zap className="w-4 h-4 mr-1" />
            Boosts
          </div>
        </button>
      </div>

      {activeTab === "cards" ? (
        <div className="grid grid-cols-2 gap-4 mx-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-[#1a2235] rounded-xl p-4 shadow-md border border-gray-800/50 transition-all duration-300 ${
                expandedCard === card.id ? "col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{card.name}</h3>
                <button
                  onClick={() => toggleCardExpand(card.id)}
                  className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center"
                >
                  {expandedCard === card.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className={`${expandedCard === card.id ? "flex" : ""}`}>
                <div
                  className={`bg-gradient-to-br ${card.color} rounded-xl ${
                    expandedCard === card.id ? "aspect-square w-1/3 mr-3" : "aspect-video"
                  } flex items-center justify-center mb-3 relative overflow-hidden shadow-md`}
                >
                  <div className="absolute inset-0 bg-[url('/item-pattern.png')] opacity-20"></div>
                  <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
                  {card.icon}
                </div>

                <div className={expandedCard === card.id ? "flex-1" : ""}>
                  {expandedCard === card.id && <p className="text-sm text-gray-300 mb-3">{card.description}</p>}

                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Level {card.level}</span>
                    <span className="text-amber-400">{card.currentBonus}</span>
                  </div>

                  <div className="w-full bg-gray-700 h-1.5 rounded-full mb-3">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>

                  {expandedCard === card.id && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {card.stats.map((stat, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-400">{stat.name}</p>
                          <p className="text-sm font-bold">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 rounded-lg py-2 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    onClick={() => purchaseItem(card)}
                  >
                    <Coins className="w-4 h-4 mr-1 text-white" />
                    <span className="font-bold text-sm">{card.nextLevelCost.toLocaleString()}</span>
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-1">Next: {card.nextBonus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mx-4">
          {boosts.map((boost) => (
            <div
              key={boost.id}
              className="bg-[#1a2235] rounded-xl p-4 flex items-center shadow-md border border-gray-800/50"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${boost.color} rounded-lg flex items-center justify-center mr-3 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[url('/item-pattern.png')] opacity-20"></div>
                {boost.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{boost.name}</h3>
                <p className="text-xs text-gray-400">{boost.description}</p>
              </div>
              <button
                className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg py-2 px-3 flex items-center shadow-md active:scale-95 transition-transform"
                onClick={() => purchaseItem(boost)}
              >
                <Coins className="w-4 h-4 mr-1 text-white" />
                <span className="font-bold text-sm">{boost.cost.toLocaleString()}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Animation */}
      {showPurchaseAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 animate-bounce-in shadow-lg">
            <div className="flex items-center">
              <div className="mr-3">{purchasedItem.icon}</div>
              <div>
                <h3 className="font-bold text-white text-lg">{purchasedItem.name}</h3>
                <p className="text-green-200">Purchase successful!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
