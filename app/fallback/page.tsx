"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

export default function FallbackPage() {
  const [botUsername, setBotUsername] = useState("innoSwordCoinBot")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Extract bot username from URL if available
    const params = new URLSearchParams(window.location.search)
    const username = params.get("bot")
    if (username) {
      setBotUsername(username)
    }

    setIsLoading(false)
  }, [])

  const openInTelegram = () => {
    window.location.href = `https://t.me/${botUsername}/start`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#121724]">
      <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L16 6V10L22 16L20 18L18 16L14 20L10 16L6 20L4 18L10 12V6L12 2Z"
            fill="#ffffff"
            stroke="#121724"
            strokeWidth="1"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-amber-400 mb-2">Sword Coin</h1>
      <p className="text-gray-300 mb-6">Tap-to-Earn Telegram Mini App</p>

      <div className="bg-[#1a2235] rounded-xl p-6 mb-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Bu uygulama sadece Telegram içinde çalışır</h2>
        <p className="text-gray-300 mb-6">
          Sword Coin uygulamasını kullanmak için Telegram uygulamasından açmanız gerekmektedir.
        </p>

        <button
          onClick={openInTelegram}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
        >
          Telegram'da Aç <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-500 text-sm">
        Sorun yaşamaya devam ederseniz, lütfen Telegram'da @{botUsername} ile iletişime geçin.
      </p>
    </div>
  )
}
