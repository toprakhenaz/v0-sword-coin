"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import TelegramInit from "@/components/telegram-init"

// Add this function at the top level
function isTelegramWebAppSupported() {
  if (typeof window === "undefined") return false

  // Check if Telegram WebApp is available
  if (window.Telegram?.WebApp) return true

  // Check if we're in a mobile browser that might be the Telegram in-app browser
  const isMobileBrowser = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    isMobileBrowser &&
    (window.location.href.includes("tgWebAppData=") ||
      document.referrer.includes("t.me/") ||
      navigator.userAgent.includes("Telegram"))
  )
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingEnvironment, setIsCheckingEnvironment] = useState(true)

  useEffect(() => {
    // Skip check if we're already on the fallback page
    if (pathname === "/fallback") {
      setIsCheckingEnvironment(false)
      return
    }

    // Check if we're in Telegram
    if (!isTelegramWebAppSupported() && process.env.NODE_ENV !== "development") {
      router.push("/fallback")
    } else {
      setIsCheckingEnvironment(false)
    }
  }, [pathname, router])

  if (isCheckingEnvironment && pathname !== "/fallback") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // If we're on the fallback page, render without TelegramInit
  if (pathname === "/fallback") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <TelegramInit>
        <div className="w-full max-w-md mx-auto min-h-screen h-full flex flex-col relative overflow-hidden">
          <main className="flex-1 overflow-auto pt-safe-top pb-20 px-safe-left pr-safe-right">{children}</main>
          <Navigation />
        </div>
      </TelegramInit>
    </ThemeProvider>
  )
}
