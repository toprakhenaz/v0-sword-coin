"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Client-side authentication check
export function useClientAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [telegramId, setTelegramId] = useState<string | null>(null)

  useEffect(() => {
    const checkClientAuth = async () => {
      try {
        // Check for cookies on client side
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        const userIdFromCookie = cookies["user_id"]
        const telegramIdFromCookie = cookies["telegram_id"]

        if (userIdFromCookie && telegramIdFromCookie) {
          setIsAuthenticated(true)
          setUserId(userIdFromCookie)
          setTelegramId(telegramIdFromCookie)
        } else {
          setIsAuthenticated(false)
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkClientAuth()
  }, [router])

  return { isLoading, isAuthenticated, userId, telegramId }
}

// Client-side logout
export async function clientLogout() {
  try {
    // Call the server action to clear cookies
    await fetch("/api/logout", {
      method: "POST",
    })

    // Redirect to login page
    window.location.href = "/login"
    return { success: true }
  } catch (error) {
    console.error("Error logging out:", error)
    return { success: false, error }
  }
}
