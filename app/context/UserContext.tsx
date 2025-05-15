"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserContextType {
  userId: number
  setUserId: (id: number) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number>(1) // Default userId as 1

  return <UserContext.Provider value={{ userId, setUserId }}>{children}</UserContext.Provider>
}
