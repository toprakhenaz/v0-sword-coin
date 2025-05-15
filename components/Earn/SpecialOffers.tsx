"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { Card, CardContent } from "./EarnCard"
import { Button } from "./Button"
import Modal from "./Modal"
import { Alert, AlertDescription, AlertTitle } from "./Alert"
import axios from "axios"
import confetti from "canvas-confetti"
import { missions } from "@/data/GeneralData"
import type { SpecialOffer } from "@/types"

export default function SpecialOffers() {
  const [popupOpen, setPopupOpen] = useState<boolean>(false)
  const [popupMessage, setPopupMessage] = useState<string>("")
  const [isGreen, setIsGreen] = useState<boolean>(false)
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(missions)
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null)

  const showPopup = (message: string): void => {
    setPopupMessage(message)
    setPopupOpen(true)
  }

  const handleSpecialOffer = async (offer: SpecialOffer): Promise<void> => {
    setSelectedOffer(offer)

    try {
      window.open(offer.link, "_blank")

      setTimeout(async () => {
        try {
          await axios.post("/api/complete-mission", {
            userId: 1, // This would normally come from the user context
            missionDate: new Date(),
            missionStatus: true,
            missionRef: offer.title,
            missionId: offer.id,
          })

          setIsGreen(true)
          showPopup(`Tebrikler! ${offer.reward} coin kazandınız!`)

          setSpecialOffers(specialOffers.map((o) => (o.id === offer.id ? { ...o, isClaimed: true } : o)))

          // Trigger a smaller confetti effect
          if (typeof window !== "undefined") {
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.6 },
              colors: ["#FFD700", "#FFDF00", "#F0E68C"],
            })
          }
        } catch (error) {
          console.error("Görev kaydedilirken hata oluştu:", error)
          setIsGreen(false)
          showPopup("Görev kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.")
        }

        setSelectedOffer(null)
      }, 5000)
    } catch (error) {
      console.error("Ödül kaydedilirken hata oluştu:", error)
      setSelectedOffer(null)
      setIsGreen(false)
      showPopup("Görev açılırken bir hata oluştu. Lütfen tekrar deneyin.")
    }
  }

  return (
    <>
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
    </>
  )
}
