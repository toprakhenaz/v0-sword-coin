"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { Card, CardContent } from "./EarnCard"
import { Button } from "./Button"
import { Progress } from "./Progress"
import Modal from "./Modal"
import { Alert, AlertDescription, AlertTitle } from "./Alert"
import axios from "axios"
import confetti from "canvas-confetti"
import { dailyRewardData } from "@/data/GeneralData"

interface DailyRewardProps {
  userId: number
  coins: number
  dailyRewardStreak: number
  dailyRewardDate: Date
  dailyRewardClaimed: boolean
}

export default function DailyReward({
  userId,
  coins,
  dailyRewardStreak,
  dailyRewardDate,
  dailyRewardClaimed,
}: DailyRewardProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [popupOpen, setPopupOpen] = useState<boolean>(false)
  const [popupMessage, setPopupMessage] = useState<string>("")
  const [isGreen, setIsGreen] = useState<boolean>(false)
  const [dailyRewards] = useState<number[]>(dailyRewardData)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [userCoins, setUserCoins] = useState<number>(coins)
  const [userDailyRewardStreak, setUserDailyRewardStreak] = useState<number>(dailyRewardStreak)
  const [userDailyRewardClaimed, setUserDailyRewardClaimed] = useState<boolean>(dailyRewardClaimed)

  const showPopup = (message: string): void => {
    setPopupMessage(message)
    setPopupOpen(true)
  }

  const handleDailyReward = async (): Promise<void> => {
    if (userDailyRewardClaimed) {
      setIsGreen(false)
      showPopup("Zaten günlük ödülünüzü aldınız!")
      return
    }

    const newStreak = userDailyRewardStreak + 1
    const newCoins = userCoins + dailyRewards[(newStreak - 1) % dailyRewards.length]

    try {
      await axios.post("/api/claim-daily-reward", {
        userId: userId,
        coins: newCoins,
        dailyRewardStreak: newStreak,
        dailyRewardDate: new Date(),
        dailyRewardClaimed: true,
      })

      setUserCoins(newCoins)
      setUserDailyRewardStreak(newStreak)
      setUserDailyRewardClaimed(true)

      setIsGreen(true)
      showPopup(`Günün ödülü: ${dailyRewards[(newStreak - 1) % dailyRewards.length]} coin aldınız!`)
      setModalOpen(false)

      // Trigger confetti effect
      setShowConfetti(true)

      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#FFDF00", "#F0E68C"],
        })
      }

      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    } catch (error) {
      console.error("Günlük ödül kaydedilirken hata oluştu:", error)
    }
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-yellow-600 to-yellow-800 mb-4 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-white">Günlük Ödül</h3>
              <p className="text-sm text-yellow-100">Streak: {userDailyRewardStreak} gün</p>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className={`bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                userDailyRewardClaimed ? "opacity-50" : "animate-pulse"
              }`}
              disabled={userDailyRewardClaimed}
            >
              <FontAwesomeIcon icon={icons.gift} className="mr-2" />
              {userDailyRewardClaimed ? "Alındı" : "Ödülü Al"}
            </Button>
          </div>
          <Progress value={((userDailyRewardStreak % 7) * 100) / 7} className="mt-2" />
          <div className="flex justify-between mt-1 text-xs text-yellow-100 font-medium">
            <div>Gün 1</div>
            <div>Gün 7</div>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="text-center">
          <FontAwesomeIcon icon={icons.gift} className="text-yellow-400 text-4xl mb-4" />
          <h2 className="text-xl font-bold mb-4">Günlük Ödüller</h2>
        </div>
        <ul className="mb-4 space-y-3">
          {dailyRewards.map((reward, index) => (
            <li
              key={index}
              className={`flex justify-between items-center p-2 rounded ${
                (index + 1) % dailyRewards.length === (userDailyRewardStreak + 1) % dailyRewards.length
                  ? "bg-blue-900/30 border border-blue-500/50"
                  : ""
              }`}
            >
              <span className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-2 text-xs font-bold">
                  {index + 1}
                </div>
                Gün {index + 1}
              </span>
              <span
                className={`font-bold ${
                  (index + 1) % dailyRewards.length === (userDailyRewardStreak + 1) % dailyRewards.length
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                {reward} coin
              </span>
            </li>
          ))}
        </ul>
        <Button
          onClick={handleDailyReward}
          className={`w-full ${
            userDailyRewardClaimed
              ? "bg-gray-600 text-gray-300"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
          } font-bold py-3 rounded-lg transition-all duration-300 mb-2`}
          disabled={userDailyRewardClaimed}
        >
          {userDailyRewardClaimed ? "Bugün Zaten Aldınız" : "Ödülünü Al"}
        </Button>
        <Button
          onClick={() => setModalOpen(false)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-all duration-300"
        >
          Kapat
        </Button>
      </Modal>

      <Modal isOpen={popupOpen} onClose={() => setPopupOpen(false)}>
        <Alert isGreen={isGreen}>
          <AlertTitle>Bildirim</AlertTitle>
          <AlertDescription>{popupMessage}</AlertDescription>
        </Alert>
        <Button
          onClick={() => setPopupOpen(false)}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-all duration-300"
        >
          Tamam
        </Button>
      </Modal>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {/* This div just serves as a container for the confetti effect */}
        </div>
      )}
    </>
  )
}
