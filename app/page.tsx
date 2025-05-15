"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/providers/UserProvider"
import { useTelegram } from "@/hooks/useTelegram"
import MainPage from "@/components/Home/MainPage"
import SkeletonLoading from "@/components/Skeleton/SkeletonMain"
import DesktopWarning from "@/components/DesktopWarning"
import { useDeviceDetection } from "@/providers/DeviceDetectionProvider"

export default function Home() {
  const router = useRouter()
  const { user, loading, initUser } = useUser()
  const { telegramUser, startParam } = useTelegram()
  const { isMobile } = useDeviceDetection()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      if (telegramUser) {
        await initUser(telegramUser, startParam)
      } else {
        // For development without Telegram
        await initUser(
          {
            id: 12345,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "en",
            allows_write_to_pm: true,
          },
          "",
        )
      }
      setIsInitializing(false)
    }

    if (!loading) {
      initialize()
    }
  }, [loading, telegramUser, startParam, initUser])

  if (loading || isInitializing) {
    return <SkeletonLoading />
  }

  if (!isMobile) {
    return <DesktopWarning />
  }

  if (!user) {
    return <div>Error loading user data. Please try again.</div>
  }

  return (
    <div className="mobile-content">
      <MainPage user={user} />
    </div>
  )
}
