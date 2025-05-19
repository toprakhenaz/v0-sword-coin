"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"

// Pages that don't require authentication
const publicPages = ["/login"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and not on a public page, redirect to login
      if (!isAuthenticated && !publicPages.includes(pathname)) {
        router.push("/login")
      } else {
        setIsReady(true)
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading state while checking authentication
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  // If on login page and authenticated, this will be handled by the login page itself
  // Otherwise, render children
  return <>{children}</>
}
