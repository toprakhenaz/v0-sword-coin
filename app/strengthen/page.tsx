"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import StrengthenPage from "@/components/Strengthen/StrengthenPage"
import type { User } from "@prisma/client"
import SkeletonLoading from "../skeleton/SkeletonEarn" // Reusing the Earn skeleton for now
import { useUserContext } from "../context/UserContext"

export default function StrengthenPageWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const { userId, setUserId } = useUserContext()

  const fetchUserData = async (id: number) => {
    try {
      const response = await axios.post("/api/fetch-user", { userId: id })
      setUser(response.data.user)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(userId)
      fetchUserData(userId)
    } else {
      fetchUserData(1)
    }
  }, [])

  if (!user) {
    return <SkeletonLoading />
  }

  return <StrengthenPage user={user} />
}
