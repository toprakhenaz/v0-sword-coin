"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/context/UserContext"

// Pages that don't require authentication
const publicPages = ["/login"]

export default function ClientAuthCheck({ children }: { children: React.ReactNode }) {
  const { userId, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not on a public page, redirect to login
      if (!userId && !publicPages.includes(pathname)) {
        router.push("/login")
      } else {
        setIsReady(true)
      }
    }
  }, [userId, isLoading, pathname, router])

  // Show loading state while checking authentication
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If on login page and authenticated, this will be handled by the login page itself
  // Otherwise, render children
  return <>{children}</>
}
