"use client"

import { useState } from "react"
import TimerBar from "./TimeBar"
import Card from "./Card"
import BottomNav from "./BottomNav"
import Navbar from "../Navbar"
import ConfirmationPopup from "./ConfirmationPopup"
import Popup from "../Popup"
import { Cards } from "@/data/cardData"
import type { CardData } from "@/types"
import HeaderCard from "../HeaderCard"
import type { User } from "@prisma/client"
import axios from "axios"

// Add sound effect
const levelUpSound = typeof Audio !== "undefined" ? new Audio("/sounds/level-up.mp3") : null

interface UserType {
  user: User & { cards: { id: number; userId: number; cardId: number; level: number }[] }
}

interface UpgradeData {
  userId: number
  cardId: number
  newLevel: number
  newUserCoins: number
  newUsercrystals: number
  newFoundCards?: string
  newDailyCardsFound: boolean
}

const initialCards: CardData[] = Cards

const MainPage = ({ user }: UserType) => {
  const calculateUpgradeCost = (level: number, oldCost: number) => {
    return Math.pow(2, level) * 50 + oldCost
  }

  const calculatecrystals = (level: number, oldEarn: number) => {
    return level * 5 + oldEarn
  }

  const userCards = initialCards.map((card) => {
    const userCard = user.cards.find((userCard) => userCard.cardId === card.id)
    return {
      ...card,
      level: userCard ? userCard.level : card.level,
      crystals: userCard ? calculatecrystals(userCard.level, card.crystals) : card.crystals,
      upgradeCost: userCard ? calculateUpgradeCost(userCard.level, card.upgradeCost) : card.upgradeCost,
    }
  })

  const [cards, setCards] = useState<CardData[]>(userCards)
  const [coins, setCoins] = useState(user.coins)
  const [crystals, setcrystals] = useState(user.crystals)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [cardFounded, setCardFounded] = useState(false)
  const [foundCards, setFoundCards] = useState<number[]>(user.foundCards.split(",").map(Number))
  const [activeCategory, setActiveCategory] = useState("Ekipman")
  const [allCardsFound, setAllCardsFound] = useState(user.dailyCardRewardClaimed)
  const [dailyCardFoundPopup, setDailyCardFoundPopup] = useState(false)
  const [dailyCombo, setDailyCombo] = useState<number[]>([1, 2, 3])

  /*
  useEffect(() => {
    const fetchDailyCombo = async () => {
      try {
        const response = await axios.get('/api/daily-combo');
        
        setDailyCombo(response.data.cards.split(',').map(Number));
        console.log(response.data.cards);
      } catch (error) {
        console.error('Error fetching daily combo:', error);
      }
    };

    fetchDailyCombo();
  }, []);*/

  const handleUpgradeClick = (card: CardData) => {
    if (coins >= card.upgradeCost) {
      setSelectedCard(card)
      setShowPopup(true)
    } else {
      alert("Yeterli coininiz yok!")
    }
  }

  const saveUserCardData = async (data: UpgradeData) => {
    try {
      const response = await axios.post("/api/upgradeCard", data)
      console.log("User data saved successfully", response.data)
    } catch (error) {
      console.error("Error saving card data:", error)
    }
  }

  const handleUpgradeConfirm = async () => {
    if (selectedCard) {
      let newCoins = coins - selectedCard.upgradeCost
      const newLevel = selectedCard.level + 1
      const newUpgradeCost = calculateUpgradeCost(newLevel, selectedCard.upgradeCost)
      const newcrystals = calculatecrystals(newLevel, selectedCard.crystals)
      const newUsercrystals = crystals + selectedCard.crystals

      // Play sound effect when upgrading
      if (levelUpSound) {
        levelUpSound.currentTime = 0
        levelUpSound.play().catch((e) => console.log("Error playing sound:", e))
      }

      let updatedFoundCards = [...foundCards]
      let newAllCardsFound = allCardsFound

      if (dailyCombo.includes(selectedCard.id) && !foundCards.includes(selectedCard.id)) {
        updatedFoundCards = [...updatedFoundCards, selectedCard.id]

        // Check if all daily combo cards are found after this upgrade
        if (dailyCombo.every((cardId) => updatedFoundCards.includes(cardId)) && !allCardsFound) {
          newCoins += 100000
          setDailyCardFoundPopup(true)
          newAllCardsFound = true
        }

        setFoundCards(updatedFoundCards)
        setCardFounded(true)
      }

      const myCard = user.cards.find((userCard) => userCard.cardId === selectedCard.id)

      const data: UpgradeData = {
        userId: user.id,
        cardId: myCard ? myCard.id : selectedCard.id,
        newLevel: newLevel,
        newUserCoins: newCoins,
        newUsercrystals: newUsercrystals,
        newFoundCards: updatedFoundCards.join(","),
        newDailyCardsFound: newAllCardsFound,
      }

      await saveUserCardData(data)

      setCoins(newCoins)
      setcrystals(newUsercrystals)
      setAllCardsFound(newAllCardsFound)

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === selectedCard.id
            ? {
                ...card,
                level: newLevel,
                crystals: newcrystals,
                upgradeCost: newUpgradeCost,
              }
            : card,
        ),
      )
    }
    setShowPopup(false)
  }

  const filteredCards = cards.filter((card) => card.category === activeCategory)

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-1 space-y-4 bg-gray-900 text-white font-['Poppins',sans-serif]">
      <HeaderCard coins={coins} crystals={crystals} />
      <TimerBar dailyCombo={dailyCombo} foundCards={foundCards} />
      <BottomNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ height: "45vh" }}>
        {filteredCards.map((card) => (
          <Card key={card.id} card={card} onUpgrade={() => handleUpgradeClick(card)} coins={coins} />
        ))}
      </div>

      <Navbar />

      {showPopup && selectedCard && (
        <ConfirmationPopup
          title="Kart Yükseltme"
          message={`${selectedCard.name} kartını ${selectedCard.upgradeCost} coin karşılığında yükseltmek istiyor musunuz?`}
          onConfirm={handleUpgradeConfirm}
          onCancel={() => setShowPopup(false)}
        />
      )}

      {dailyCardFoundPopup && (
        <Popup
          title="Bütün Kartlar Bulundu!"
          message={`Günlük komboyu tamamladınız ve 100.000 coin kazandınız!!`}
          image={"/coins.png"}
          onClose={() => setDailyCardFoundPopup(false)}
        />
      )}

      {cardFounded && (
        <Popup
          title="Kart Bulundu!"
          message={`${cards.find((card) => card.id === foundCards[foundCards.length - 1])?.name} kartı günlük komboda bulundu!`}
          image={cards.find((card) => card.id === foundCards[foundCards.length - 1])?.image || ""}
          onClose={() => setCardFounded(false)}
        />
      )}
    </div>
  )
}

export default MainPage
