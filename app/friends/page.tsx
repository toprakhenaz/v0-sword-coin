"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/providers/UserProvider"
import { Navbar } from "@/components/Navbar"
import { SkeletonFriends } from "@/app/skeleton/SkeletonFriends"

export default function FriendsPage() {
  const { user, loading } = useUser()
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [referralLink, setReferralLink] = useState("")

  useEffect(() => {
    if (user) {
      // Mock referral verileri
      const mockReferrals = [
        {
          id: 1,
          referrerId: user.id,
          referredId: 2,
          referredName: "friend1",
          rewardAmount: 100000,
          isClaimed: false,
          previousLeague: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          referrerId: user.id,
          referredId: 3,
          referredName: "friend2",
          rewardAmount: 100000,
          isClaimed: true,
          previousLeague: 1,
          createdAt: new Date().toISOString(),
        },
      ]

      setReferrals(mockReferrals)
      setReferralLink(`https://t.me/SwordCoinBot?start=${user.id}`)
      setIsLoading(false)
    }
  }, [user])

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => alert("Referans linki kopyalandı!"))
      .catch((err) => console.error("Kopyalama hatası:", err))
  }

  const handleClaimReward = async (referralId: number) => {
    // Mock ödül alma işlemi
    setReferrals((prev) => prev.map((ref) => (ref.id === referralId ? { ...ref, isClaimed: true } : ref)))

    // Kullanıcı coin'lerini güncelle
    // Bu kısım gerçek uygulamada API çağrısı yapacak
  }

  if (loading || isLoading) {
    return <SkeletonFriends />
  }

  const unclaimedReferrals = referrals.filter((ref) => !ref.isClaimed)
  const claimedReferrals = referrals.filter((ref) => ref.isClaimed)

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Arkadaşlarını Davet Et</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="mb-2">Referans linkiniz:</p>
          <div className="flex">
            <input type="text" value={referralLink} readOnly className="flex-1 p-2 border rounded-l" />
            <button onClick={handleCopyLink} className="bg-blue-500 text-white px-4 py-2 rounded-r">
              Kopyala
            </button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Bekleyen Ödüller</h2>
        {unclaimedReferrals.length > 0 ? (
          <div className="bg-white rounded-lg shadow divide-y">
            {unclaimedReferrals.map((ref) => (
              <div key={ref.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{ref.referredName}</p>
                  <p className="text-sm text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleClaimReward(ref.id)} className="bg-green-500 text-white px-4 py-2 rounded">
                  {ref.rewardAmount.toLocaleString()} Coin Al
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Bekleyen ödül yok</p>
          </div>
        )}

        <h2 className="text-xl font-semibold mt-4 mb-2">Alınan Ödüller</h2>
        {claimedReferrals.length > 0 ? (
          <div className="bg-white rounded-lg shadow divide-y">
            {claimedReferrals.map((ref) => (
              <div key={ref.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{ref.referredName}</p>
                  <p className="text-sm text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-gray-500">{ref.rewardAmount.toLocaleString()} Coin Alındı</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500">Alınan ödül yok</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
