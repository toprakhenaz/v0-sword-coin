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
          // Check if we're in a mobile browser that might be the Telegram in-app browser
          const isMobileBrowser = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

          if (isMobileBrowser && window.location.href.includes("tgWebAppData=")) {
            // We're likely in Telegram but WebApp object isn't initialized yet
            console.log("Telegram WebApp API not found but we appear to be in Telegram. Continuing...")
            setIsInitialized(true)
            return
          }

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
            console.warn("Kullanıcı doğrulaması başarısız oldu, devam ediliyor")
          }

          // Kullanıcı bilgilerini localStorage'a kaydet
          if (verificationResult?.user) {
            localStorage.setItem("telegramUser", JSON.stringify(verificationResult.user))
          }
        } else {
          // Try to get user from WebApp directly
          const user = window.Telegram.WebApp.initDataUnsafe.user
          if (user) {
            localStorage.setItem(
              "telegramUser",
              JSON.stringify({
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
              }),
            )
          }
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
        <p className="text-gray-400 mb-4">
          Bu uygulama sadece Telegram içinde çalışır. Lütfen Telegram uygulamasından açın.
        </p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Tekrar Dene
        </button>
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
