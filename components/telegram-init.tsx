"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { initTelegramWebApp, verifyTelegramUser } from "@/lib/telegram"

export default function TelegramInit({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initApp = async () => {
      try {
        // Telegram Web App API'sini başlat
        const telegramApp = initTelegramWebApp()

        // Tarayıcı ortamında mıyız kontrol et
        if (typeof window === "undefined") {
          return
        }

        // Telegram Web App API mevcut mu kontrol et
        if (!window.Telegram?.WebApp) {
          // Geliştirme ortamında ise devam et, üretimde hata göster
          if (process.env.NODE_ENV === "development") {
            console.warn("Telegram Web App API bulunamadı, geliştirme modunda devam ediliyor")
            setIsInitialized(true)
            return
          } else {
            throw new Error("Bu uygulama sadece Telegram içinde çalışır")
          }
        }

        // Kullanıcı doğrulaması (isteğe bağlı)
        const initData = window.Telegram.WebApp.initData
        if (initData) {
          const verificationResult = await verifyTelegramUser(initData)
          if (!verificationResult?.verified) {
            throw new Error("Kullanıcı doğrulaması başarısız oldu")
          }

          // Kullanıcı bilgilerini localStorage'a kaydet
          localStorage.setItem("telegramUser", JSON.stringify(verificationResult.user))
        }

        setIsInitialized(true)
      } catch (err) {
        console.error("Telegram Web App başlatma hatası:", err)
        setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu")
      }
    }

    initApp()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-red-900/30 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Hata</h2>
          <p className="text-red-200">{error}</p>
        </div>
        <p className="text-gray-400">
          Bu uygulama sadece Telegram içinde çalışır. Lütfen Telegram uygulamasından açın.
        </p>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
