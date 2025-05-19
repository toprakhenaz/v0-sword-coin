"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@/context/UserContext"
import { validateAndProcessTelegramAuth } from "@/lib/auth-actions"

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: any) => void
    }
  }
}

interface TelegramLoginProps {
  botName: string
  buttonSize?: "large" | "medium" | "small"
  cornerRadius?: number
  requestAccess?: boolean
  usePic?: boolean
  className?: string
}

export default function TelegramLogin({
  botName,
  buttonSize = "large",
  cornerRadius = 8,
  requestAccess = true,
  usePic = true,
  className = "",
}: TelegramLoginProps) {
  const telegramRef = useRef<HTMLDivElement>(null)
  const { setTelegramUser } = useUser()

  useEffect(() => {
    // Check if Telegram script is available
    const isTelegramAvailable =
      typeof window !== "undefined" && window.navigator.onLine && !window.navigator.userAgent.includes("TelegramWebApp")

    if (!isTelegramAvailable) {
      console.log("Telegram login widget not available")
      return
    }

    // Create the script element
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-login", botName)
    script.setAttribute("data-size", buttonSize)
    script.setAttribute("data-radius", cornerRadius.toString())
    script.setAttribute("data-request-access", requestAccess ? "write" : "read")
    script.setAttribute("data-userpic", usePic.toString())
    script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)")

    // Define the callback function
    window.TelegramLoginWidget = {
      dataOnauth: async (user) => {
        console.log("Telegram auth received:", user)

        // Use the server action to validate and process the authentication
        const result = await validateAndProcessTelegramAuth(user)

        if (result.success && result.user) {
          // Set the user in context
          setTelegramUser(result.user)
        } else {
          console.error("Telegram authentication failed:", result.error)
        }
      },
    }

    // Add the script to the container
    if (telegramRef.current) {
      telegramRef.current.appendChild(script)
    }

    return () => {
      // Clean up
      if (telegramRef.current && telegramRef.current.contains(script)) {
        telegramRef.current.removeChild(script)
      }
    }
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, setTelegramUser])

  return <div ref={telegramRef} className={className}></div>
}
