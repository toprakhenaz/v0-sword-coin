"use client"

import CoinBalance from "@/components/coin-balance"
import { Copy, UserPlus, Gift, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { inviteFriend } from "@/lib/telegram-share"
import { useTelegramUser } from "@/hooks/use-telegram-user"

export default function FriendsPage() {
  const { user } = useTelegramUser()
  const [referralCode, setReferralCode] = useState("SWORD123")
  const [referrals, setReferrals] = useState([])
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    // Kullanıcı ID'sine göre referans kodu oluştur
    if (user?.id) {
      // Gerçek uygulamada API'den alınacak
      setReferralCode(`SW${user.id.toString().substring(0, 6)}`)
    }

    // Referans verilerini yükle (gerçek uygulamada API çağrısı yapılacak)
    const loadReferrals = async () => {
      // Demo veriler
      const demoReferrals = [
        { id: 1, username: "KriptoKral", date: "2023-12-15", reward: 100000 },
        { id: 2, username: "AltınAvcısı", date: "2023-12-20", reward: 100000 },
      ]

      setReferrals(demoReferrals)
      setTotalReferrals(demoReferrals.length)
      setTotalEarned(demoReferrals.reduce((total, ref) => total + ref.reward, 0))
    }

    loadReferrals()
  }, [user])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleInvite = () => {
    inviteFriend(referralCode, "your_bot_username") // Bot kullanıcı adınızı buraya ekleyin
  }

  return (
    <div className="pb-4">
      <CoinBalance />

      <div className="text-center my-8">
        <h1 className="text-4xl font-bold mb-2">{totalReferrals} Arkadaşlar</h1>
        <p className="text-gray-400">Bir arkadaş davet et ve bonuslar kazan</p>
      </div>

      {/* Referans Kodu Kartı */}
      <div className="bg-[#1a2235] rounded-xl p-6 mx-4 mb-6">
        <h2 className="text-lg font-bold mb-4 text-amber-400">Referans Kodun</h2>
        <div className="bg-[#1e2738] rounded-lg p-3 flex justify-between items-center mb-4">
          <span className="font-mono font-bold text-lg">{referralCode}</span>
          <button
            className={`p-2 rounded-lg ${copySuccess ? "bg-green-600" : "bg-gray-700"}`}
            onClick={copyToClipboard}
          >
            {copySuccess ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center mr-4">
            <Gift className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="font-medium">Arkadaşını davet et</p>
            <p className="text-gray-400">Her arkadaş için 100.000 Altın Kazan</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-medium">Toplam Kazanç</p>
            <p className="text-amber-400">{totalEarned.toLocaleString()} Altın</p>
          </div>
        </div>
      </div>

      {/* Referans Listesi */}
      <div className="mx-4 mb-4">
        <h2 className="text-lg font-bold mb-4">Referansların</h2>

        {referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-[#1a2235] rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <span className="font-bold">{referral.username.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{referral.username}</p>
                    <p className="text-xs text-gray-400">{new Date(referral.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold">+{referral.reward.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a2235] rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-3">Henüz referansın yok</p>
            <p className="text-sm text-gray-500">Arkadaşlarını davet et ve ödüller kazan!</p>
          </div>
        )}
      </div>

      <div className="flex mx-4 gap-2">
        <button
          className="flex-1 bg-blue-500 rounded-lg py-3 font-bold flex items-center justify-center"
          onClick={handleInvite}
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Arkadaşını Davet Et
        </button>
        <button className="bg-gray-700 rounded-lg p-3" onClick={copyToClipboard}>
          <Copy className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
