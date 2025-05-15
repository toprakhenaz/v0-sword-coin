"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Earn from "@/components/Earn/Earn"
import type { Mission, User } from "@prisma/client"
import SkeletonLoading from "../skeleton/SkeletonEarn"
import { useUserContext } from "../context/UserContext"

interface UserWithMissions extends User {
  missions: Mission[]
}

export default function EarnPage() {
  const [user, setUser] = useState<UserWithMissions | null>(null)
  const { userId, setUserId } = useUserContext()
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await axios.post("/api/fetch-earn", { userId: id })
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Client-side only code
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") ? Number.parseInt(localStorage.getItem("userId") || "1") : 1

      setUserId(storedUserId)
      fetchUserData(storedUserId)
    }
  }, [setUserId])

  // Show skeleton while loading
  if (isLoading || !user) {
    return <SkeletonLoading />
  }

  return <Earn user={user} />
}
