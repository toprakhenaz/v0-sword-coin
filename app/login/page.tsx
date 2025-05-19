"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { telegramAuth } from "../actions/auth-actions"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Telegram WebApp'i başlat
    if (window.Telegram && window.Telegram.WebApp) {
      const tgWebApp = window.Telegram.WebApp
      tgWebApp.ready()
      tgWebApp.expand()

      // initData varsa hemen kimlik doğrulamasını yap
      if (tgWebApp.initData) {
        handleTelegramAuth(tgWebApp.initData)
      } else {
        setError("Telegram WebApp initData bulunamadı. Bu uygulama sadece Telegram içinde çalışır.")
        setIsLoading(false)
      }
    } else {
      setError("Bu uygulama sadece Telegram içinde çalışır.")
      setIsLoading(false)
    }
  }, [router])

  const handleTelegramAuth = async (initData: string) => {
    try {
      const result = await telegramAuth(initData)
      if (result.success) {
        router.push("/")
      } else {
        setError(result.error || "Kimlik doğrulama başarısız oldu")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Kimlik doğrulama sırasında hata:", error)
      setError("Beklenmeyen bir hata oluştu")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sword Coin</h1>
          <p className="text-gray-400">Telegram Mini App</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Bu uygulama sadece Telegram içinde çalışır.</p>
          <p>Lütfen Telegram'dan açın!</p>
        </div>
      </div>
    </div>
  )
}
