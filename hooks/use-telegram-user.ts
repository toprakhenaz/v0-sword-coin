"use client"

import { useState, useEffect } from "react"

interface TelegramUser {
  id: number
  username?: string
  firstName: string
  lastName?: string
  photoUrl?: string
}

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = () => {
      try {
        // Önce localStorage'dan kontrol et
        const savedUser = localStorage.getItem("telegramUser")

        if (savedUser) {
          setUser(JSON.parse(savedUser))
          setIsLoading(false)
          return
        }

        // Telegram Web App API mevcut mu kontrol et
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe.user

          if (tgUser) {
            const userData: TelegramUser = {
              id: tgUser.id,
              username: tgUser.username,
              firstName: tgUser.first_name,
              lastName: tgUser.last_name,
              photoUrl: tgUser.photo_url,
            }

            setUser(userData)
            localStorage.setItem("telegramUser", JSON.stringify(userData))
          } else {
            // Geliştirme ortamında demo kullanıcı
            if (process.env.NODE_ENV === "development") {
              const demoUser: TelegramUser = {
                id: 12345678,
                username: "demo_user",
                firstName: "Demo",
                lastName: "User",
              }
              setUser(demoUser)
            } else {
              setError("Kullanıcı bilgisi bulunamadı")
            }
          }
        } else if (process.env.NODE_ENV === "development") {
          // Geliştirme ortamında demo kullanıcı
          const demoUser: TelegramUser = {
            id: 12345678,
            username: "demo_user",
            firstName: "Demo",
            lastName: "User",
          }
          setUser(demoUser)
        } else {
          setError("Telegram Web App API bulunamadı")
        }
      } catch (err) {
        console.error("Kullanıcı bilgisi yükleme hatası:", err)
        setError("Kullanıcı bilgisi yüklenemedi")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, isLoading, error }
}
