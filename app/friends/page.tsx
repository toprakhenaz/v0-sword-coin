"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import Friends from "@/components/Friends"
import RefferanceRow from "@/components/RefferanceRow"
import { useUser } from "@/app/context/UserContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { toast } from "@/components/ui/use-toast"
import FriendsSkeletonLoading from "@/components/skeletons/SkeletonFriends"
import Popup from "@/components/Popup"
import { createClient } from "@/lib/supabase/client"

export default function FriendsPage() {
  const { user, loading, addCoins } = useUser()
  const [referrals, setReferrals] = useState([])
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [popup, setPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [animatingRefId, setAnimatingRefId] = useState(null)
  const INVITE_URL = "https://t.me/HamsterCombatBot/HamsterCombat"
  const supabase = createClient()

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("referrals")
          .select("*, referred:users!referred_id(username)")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Transform the data to match the expected format
        const transformedReferrals = data.map((ref) => ({
          id: ref.id,
          referencedId: ref.referred_id,
          referancedName: ref.referred.username,
          referenceAmount: ref.reward_amount,
          isClaimed: ref.is_claimed,
        }))

        setReferrals(transformedReferrals)
      } catch (error) {
        console.error("Error fetching referrals:", error)
      } finally {
        setLoadingReferrals(false)
      }
    }

    if (user) {
      fetchReferrals()
    }
  }, [user, supabase])

  const collectCoins = async (refId) => {
    if (!user) return

    setAnimatingRefId(refId)

    try {
      // Find the referral
      const referral = referrals.find((ref) => ref.referencedId === refId)
      if (!referral || referral.isClaimed) return

      // Update the referral in the database
      const { error: updateError } = await supabase.from("referrals").update({ is_claimed: true }).eq("id", referral.id)

      if (updateError) throw updateError

      // Add coins to the user
      await addCoins(referral.referenceAmount)

      // Show popup
      setPopupMessage(`${referral.referenceAmount} coin kazandınız tebrikler!!`)
      setPopup(true)

      // Update local state after animation
      setTimeout(() => {
        setAnimatingRefId(null)
        setReferrals((prevReferrals) =>
          prevReferrals.map((ref) => {
            if (ref.referencedId === refId) {
              return { ...ref, isClaimed: true }
            }
            return ref
          }),
        )
      }, 1000)
    } catch (error) {
      console.error("Error collecting coins:", error)
      setAnimatingRefId(null)
    }
  }

  const handleCopyLink = () => {
    const inviteLink = `${INVITE_URL}?startapp=${user?.id}`
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: "Success",
      description: "Invitation link copied to clipboard!",
    })
  }

  if (loading || !user || loadingReferrals) {
    return <FriendsSkeletonLoading />
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans min-h-screen flex flex-col p-4">
      <HeaderCard />
      <Friends length={referrals.length || 0} />

      <div className="flex space-x-3 mb-4 mt-2">
        <button className="flex-grow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-indigo-500/20">
          Invite Friends
        </button>

        <button
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          onClick={handleCopyLink}
        >
          <FontAwesomeIcon icon={faCopy} className="w-5 h-5" />
        </button>
      </div>

      {referrals.length > 0 ? (
        <div className="space-y-4 overflow-y-auto pb-16" style={{ minHeight: "25vh", maxHeight: "60vh" }}>
          {referrals.map((referral, index) => (
            <RefferanceRow
              key={index}
              referance={referral}
              collectCoins={collectCoins}
              isAnimating={animatingRefId === referral.referencedId}
            />
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faUserGroup} className="text-3xl text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No friends yet</h3>
          <p className="text-gray-400 mb-4">Invite your friends to earn bonus coins!</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center" onClick={handleCopyLink}>
            <FontAwesomeIcon icon={faCopy} className="mr-2" />
            Copy Invitation Link
          </button>
        </div>
      )}

      <Navbar />

      {popup && (
        <Popup
          title="Referral reward collected!"
          message={popupMessage}
          image="/coins.png"
          onClose={() => {
            setPopup(false)
            setPopupMessage("")
          }}
        />
      )}
    </div>
  )
}
