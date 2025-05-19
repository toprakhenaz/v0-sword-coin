"use client"

import { useState } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import Friends from "@/components/Friends"
import RefferanceRow from "@/components/RefferanceRow"
import { Alert, AlertTitle, AlertDescription } from "@/components/Alert"
import { Button } from "@/components/Button"
import Modal from "@/components/Modal"

export default function FriendsPage() {
  const [coins, setCoins] = useState(24161)
  const [league, setLeague] = useState(6)
  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [collectingId, setCollectingId] = useState<string | null>(null)
  const [referrals, setReferrals] = useState([
    {
      referencedId: "1",
      referancedName: "Ahmet",
      referenceAmount: 100000,
      isClaimed: false,
    },
    {
      referencedId: "2",
      referancedName: "Mehmet",
      referenceAmount: 100000,
      isClaimed: true,
    },
    {
      referencedId: "3",
      referancedName: "Ayşe",
      referenceAmount: 100000,
      isClaimed: false,
    },
  ])

  const handleCollectCoins = (id: string) => {
    setCollectingId(id)

    // Simulate API call
    setTimeout(() => {
      setReferrals(referrals.map((ref) => (ref.referencedId === id ? { ...ref, isClaimed: true } : ref)))

      const referral = referrals.find((ref) => ref.referencedId === id)
      if (referral) {
        setCoins(coins + referral.referenceAmount)
      }

      setCollectingId(null)
      setShowAlert(true)

      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false)
      }, 3000)
    }, 1500)
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText("https://example.com/ref/user123")
    setShowModal(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 pb-24">
      <HeaderCard coins={coins} league={league} />

      <Friends length={referrals.length} />

      {showAlert && (
        <div className="mb-4">
          <Alert isGreen>
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Your referral reward has been successfully collected.</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="mb-6">
        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white" onClick={copyReferralLink}>
          Copy Referral Link
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">My Referrals</h2>
        {referrals.map((referance) => (
          <RefferanceRow
            key={referance.referencedId}
            referance={referance}
            collectCoins={handleCollectCoins}
            isAnimating={collectingId === referance.referencedId}
          />
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Referral Link Copied</h2>
          <p className="mb-4">Share your referral link with friends to earn rewards.</p>
          <Button
            className="bg-gradient-to-r from-green-500 to-green-700 text-white"
            onClick={() => setShowModal(false)}
          >
            OK
          </Button>
        </div>
      </Modal>

      <Navbar />
    </main>
  )
}
