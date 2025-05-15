"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Navbar from "../Navbar"
import { Alert, AlertDescription, AlertTitle } from "./Alert"
import { icons } from "@/icons"
import { Progress } from "./Progress"
import { Card, CardContent } from "./EarnCard"
import HeaderCard from "../HeaderCard"
import type { Mission, User } from "@prisma/client"
import { dailyRewardData, missions } from "@/data/GeneralData"
import Modal from "./Modal"
import type { SpecialOffer } from "@/types"
import { Button } from "./Button"
import axios from "axios"
import confetti from "canvas-confetti"

interface UserWithMissions extends User {
  missions: Mission[]
}

interface UserType {
  user: UserWithMissions
}

const initialMissions: SpecialOffer[] = missions

export default function Earn({ user }: UserType) {
  const userMissions = initialMissions.map((mission) => {
    const userMission = user.missions.find((userMission) => userMission.id === mission.id)
    return {
      ...mission,
      isClaimed: userMission?.isClaimed ? userMission?.isClaimed : false,
    }
  })

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [popupOpen, setPopupOpen] = useState<boolean>(false)
  const [popupMessage, setPopupMessage] = useState<string>("")
  const [dailyRewards] = useState<number[]>(dailyRewardData)
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(userMissions)
  const [isGreen, setIsGreen] = useState<boolean>(false)
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const showPopup = (message: string): void => {
    setPopupMessage(message)
    setPopupOpen(true)
  }

  const handleDailyReward = async (): Promise<void> => {
    if (user.dailyRewardClaimed) {
      setIsGreen(false)
      showPopup("Zaten günlük ödülünüzü aldınız!")
      return
    }

    user.dailyRewardStreak += 1
    user.coins += dailyRewards[user.dailyRewardStreak - 1]

    try {
      await axios.post("/api/claim-daily-reward", {
        userId: user.id,
        coins: user.coins,
        dailyRewardStreak: user.dailyRewardStreak,
        dailyRewardDate: new Date(),
        dailyRewardClaimed: true,
      })

      setIsGreen(true)
      showPopup(`Günün ödülü: ${dailyRewards[user.dailyRewardStreak - 1]} coin aldınız!`)
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

  const handleSpecialOffer = async (offer: SpecialOffer): Promise<void> => {
    setSelectedOffer(offer)

    try {
      window.open(offer.link, "_blank")

      setTimeout(async () => {
        user.coins += offer.reward

        await axios.post("/api/claim-mission", {
          userId: user.id,
          missionDate: new Date(),
          isClaimed: true,
          coins: user.coins,
        })

        showPopup(`Tebrikler! ${offer.reward} coin kazandınız!`)

        setSpecialOffers(specialOffers.map((o) => (o.id === offer.id ? { ...o, isClaimed: true } : o)))

        setSelectedOffer(null)

        // Trigger a smaller confetti effect
        if (typeof window !== "undefined") {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ["#FFD700", "#FFDF00", "#F0E68C"],
          })
        }
      }, 5000)
    } catch (error) {
      console.error("Ödül kaydedilirken hata oluştu:", error)
      setSelectedOffer(null)
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 mx-auto min-h-screen">
      <HeaderCard coins={user.coins} crystals={user.crystals} />

      <Card className="bg-gradient-to-r from-yellow-600 to-yellow-800 mb-4 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-white">Günlük Ödül</h3>
              <p className="text-sm text-yellow-100">Streak: {user.dailyRewardStreak} gün</p>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className={`bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                user.dailyRewardClaimed ? "opacity-50" : "animate-pulse"
              }`}
              disabled={user.dailyRewardClaimed}
            >
              <FontAwesomeIcon icon={icons.gift} className="mr-2" />
              {user.dailyRewardClaimed ? "Alındı" : "Ödülü Al"}
            </Button>
          </div>
          <Progress value={((user.dailyRewardStreak % 7) * 100) / 7} className="mt-2" />
          <div className="flex justify-between mt-1 text-xs text-yellow-100 font-medium">
            <div>Gün 1</div>
            <div>Gün 7</div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FontAwesomeIcon icon={icons.star} className="text-yellow-400 mr-2" />
        Özel Teklifler
      </h2>

      <div className="space-y-4 overflow-y-auto pb-20" style={{ maxHeight: "55vh", minHeight: "45vh" }}>
        {specialOffers.map((offer, index) => (
          <Card
            key={index}
            className={`${
              offer.isClaimed ? "bg-gray-800" : "bg-gradient-to-r from-gray-800 to-gray-700"
            } shadow-lg transition-all duration-300 hover:shadow-blue-500/10 ${
              selectedOffer?.id === offer.id ? "scale-105 border border-blue-500" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white flex items-center">
                    {offer.isClaimed && <FontAwesomeIcon icon={icons.check} className="text-green-500 mr-2" />}
                    {offer.title}
                  </h3>
                  <p className="text-sm text-yellow-500 font-medium flex items-center mt-1">
                    <FontAwesomeIcon icon={icons.coins} className="mr-1" />
                    {offer.reward} coin
                  </p>
                </div>
                <Button
                  onClick={() => handleSpecialOffer(offer)}
                  className={`${
                    offer.isClaimed
                      ? "bg-gray-600 text-gray-300"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  } font-medium px-4 py-2 rounded-lg transition-all duration-300`}
                  disabled={offer.isClaimed || selectedOffer !== null}
                >
                  <FontAwesomeIcon icon={offer.isClaimed ? icons.check : icons.externalLinkAlt} className="mr-2" />
                  {selectedOffer?.id === offer.id ? "İşleniyor..." : offer.isClaimed ? "Alındı" : "Git"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                index + 1 === user.dailyRewardStreak ? "bg-blue-900/30 border border-blue-500/50" : ""
              }`}
            >
              <span className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-2 text-xs font-bold">
                  {index + 1}
                </div>
                Gün {index + 1}
              </span>
              <span
                className={`font-bold ${index + 1 === user.dailyRewardStreak ? "text-yellow-400" : "text-gray-300"}`}
              >
                {reward} coin
              </span>
            </li>
          ))}
        </ul>
        <Button
          onClick={handleDailyReward}
          className={`w-full ${
            user.dailyRewardClaimed
              ? "bg-gray-600 text-gray-300"
              : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
          } font-bold py-3 rounded-lg transition-all duration-300 mb-2`}
          disabled={user.dailyRewardClaimed}
        >
          {user.dailyRewardClaimed ? "Bugün Zaten Aldınız" : "Ödülünü Al"}
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

      <Navbar />

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {/* This div just serves as a container for the confetti effect */}
        </div>
      )}
    </div>
  )
}
