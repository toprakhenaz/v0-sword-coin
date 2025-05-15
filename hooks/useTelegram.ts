"use client"

import { useEffect, useState } from "react"
import type { TelegramUser } from "@/types"

type TelegramWebApp = {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    start_param?: string
  }
  ready: () => void
  expand: () => void
  close: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export const useTelegram = () => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [startParam, setStartParam] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp

      // Notify Telegram that the WebApp is ready
      webApp.ready()

      // Expand the WebApp to take the full screen
      webApp.expand()

      // Get user data from Telegram
      if (webApp.initDataUnsafe?.user) {
        setTelegramUser(webApp.initDataUnsafe.user)
      }

      // Get start parameter (for referrals)
      if (webApp.initDataUnsafe?.start_param) {
        setStartParam(webApp.initDataUnsafe.start_param)
      }
    }
  }, [])

  return { telegramUser, startParam }
}
