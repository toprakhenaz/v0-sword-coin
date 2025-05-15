"use client"

import { useState } from "react"
import Navbar from "../Navbar"
import HeaderCard from "../HeaderCard"
import Friends from "./Friends"
import RefferanceRow from "./RefferanceRow"
import type { Referance, User } from "@prisma/client"
import axios from "axios"
import Popup from "../Popup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface UserWithReferences extends User {
  referances: Referance[]
}

interface UserType {
  user: UserWithReferences
}

export default function Referral({ user }: UserType) {
  const [currentUser, setCurrentUser] = useState<UserWithReferences>(user)
  const [popup, setPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [animatingRefId, setAnimatingRefId] = useState<number | null>(null)
  const INVITE_URL = "https://t.me/innoSwordCoinBot/SwordCoin"

  const collectCoins = async (refId: number) => {
    if (!currentUser) return

    setAnimatingRefId(refId)

    let totalEarned = currentUser.coins

    const updatedReferences = await Promise.all(
      currentUser.referances.map(async (ref) => {
        if (ref.referencedId === refId && !ref.isClaimed) {
          const newAmount = 100000 // Fixed reward of 100,000 coins per referral
          totalEarned += newAmount
          setPopupMessage(`${newAmount} coin kazandınız tebrikler!!`)
          setPopup(true)

          try {
            await axios.post("/api/claim-friends", {
              userId: currentUser.id,
              id: ref.id,
              isClaimed: true,
              coins: totalEarned,
            })

            return {
              ...ref,
              isClaimed: true,
            }
          } catch (error) {
            console.error("Referans ödülü kaydedilirken hata oluştu:", error)
          }
        }
        return ref
      }),
    )

    // Add delay to show animation before updating
    setTimeout(() => {
      setAnimatingRefId(null)

      setCurrentUser((prevUser) => ({
        ...prevUser,
        referances: updatedReferences,
        coins: totalEarned,
      }))
    }, 1000)
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${currentUser.id}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Davet bağlantısı panoya kopyalandı!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    })
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans min-h-screen flex flex-col p-4">
      <HeaderCard coins={currentUser.coins} crystals={currentUser?.crystals} />
      <Friends length={currentUser.referances.length || 0} />

      <div className="flex space-x-3 mb-4 mt-2">
        <button className="flex-grow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/20">
          Arkadaşını Davet Et
        </button>

        <button
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          onClick={handleCopyLink}
        >
          <FontAwesomeIcon icon={icons.copy} className="w-5 h-5" />
        </button>
      </div>

      {currentUser.referances.length > 0 ? (
        <div className="space-y-4 overflow-y-auto pb-16" style={{ minHeight: "25vh", maxHeight: "60vh" }}>
          {currentUser.referances.map((referance, index) => (
            <RefferanceRow
              key={index}
              referance={referance}
              collectCoins={collectCoins}
              isAnimating={animatingRefId === referance.referencedId}
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={icons.userGroup} className="text-3xl text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Henüz arkadaşınız yok</h3>
          <p className="text-gray-400 mb-4">Arkadaşlarını davet ederek bonus coin kazanabilirsin!</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center" onClick={handleCopyLink}>
            <FontAwesomeIcon icon={icons.copy} className="mr-2" />
            Davet Bağlantısını Kopyala
          </button>
        </div>
      )}

      <Navbar />

      {popup && (
        <Popup
          title="Referans ödülü alındı!!"
          message={popupMessage}
          image={"/coins.png"}
          onClose={() => {
            setPopup(false)
            setPopupMessage("")
          }}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}
