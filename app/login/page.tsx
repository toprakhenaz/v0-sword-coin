"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { telegramAuth } from "../actions/auth-actions"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]}: ${info}`])
  }

  useEffect(() => {
    const initTelegram = async () => {
      try {
        addDebugInfo("Telegram başlatılıyor...")

        // Önce veritabanı tablolarını oluşturalım
        try {
          addDebugInfo("Veritabanı tabloları kontrol ediliyor...")
          const seedResponse = await fetch("/api/seed")
          const seedResult = await seedResponse.json()
          addDebugInfo(`Veritabanı sonucu: ${seedResult.success ? "Başarılı" : "Başarısız"}`)
        } catch (seedError) {
          addDebugInfo(`Veritabanı hatası: ${String(seedError)}`)
        }

        // Telegram WebApp'i başlat
        if (window.Telegram && window.Telegram.WebApp) {
          const tgWebApp = window.Telegram.WebApp
          tgWebApp.ready()
          tgWebApp.expand()
          addDebugInfo("Telegram WebApp başlatıldı")

          // initData varsa hemen kimlik doğrulamasını yap
          if (tgWebApp.initData) {
            addDebugInfo(`Telegram initData bulundu (${tgWebApp.initData.length} karakter)`)
            await handleTelegramAuth(tgWebApp.initData)
          } else {
            addDebugInfo("Telegram initData bulunamadı, test modu kontrol ediliyor")

            // Geliştirme modunda test verisi ile devam et
            if (process.env.NODE_ENV === "development") {
              addDebugInfo("Geliştirme modu: Test verisi ile kimlik doğrulama")
              await handleTelegramAuth("test_data")
            } else {
              setError("Telegram WebApp initData bulunamadı. Bu uygulama sadece Telegram içinde çalışır.")
              setIsLoading(false)
            }
          }
        } else {
          addDebugInfo("Telegram WebApp bulunamadı, test modu kontrol ediliyor")

          // Geliştirme modunda test verisi ile devam et
          if (process.env.NODE_ENV === "development") {
            addDebugInfo("Geliştirme modu: Test verisi ile kimlik doğrulama")
            await handleTelegramAuth("test_data")
          } else {
            setError("Bu uygulama sadece Telegram içinde çalışır.")
            setIsLoading(false)
          }
        }
      } catch (error) {
        addDebugInfo(`Telegram başlatma hatası: ${String(error)}`)
        setError("Telegram başlatma hatası")
        setIsLoading(false)
      }
    }

    initTelegram()
  }, [router, retryCount])

  const handleTelegramAuth = async (initData: string) => {
    try {
      addDebugInfo("Kimlik doğrulama başlatılıyor...")
      const result = await telegramAuth(initData)

      if (result.success) {
        addDebugInfo("Kimlik doğrulama başarılı, ana sayfaya yönlendiriliyor")
        router.push("/")
      } else {
        addDebugInfo(`Kimlik doğrulama başarısız: ${result.error}`)
        setError(result.error || "Kimlik doğrulama başarısız oldu")
        setIsLoading(false)
      }
    } catch (error) {
      addDebugInfo(`Kimlik doğrulama sırasında hata: ${String(error)}`)
      setError("Beklenmeyen bir hata oluştu: " + String(error))
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setRetryCount((prev) => prev + 1)
    addDebugInfo("Yeniden deneniyor...")
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

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            <p className="mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg mt-2 w-full"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Bu uygulama sadece Telegram içinde çalışır.</p>
          <p>Lütfen Telegram'dan açın!</p>
        </div>

        {/* Debug bilgileri */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-xs text-gray-400 max-h-60 overflow-y-auto">
          <h3 className="font-bold mb-2">Debug Bilgileri:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} className="mb-1">
              {info}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
