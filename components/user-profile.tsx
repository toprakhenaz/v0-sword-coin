"use client"

import { useTelegramUser } from "@/hooks/use-telegram-user"
import { User } from "lucide-react"

export default function UserProfile() {
  const { user, isLoading } = useTelegramUser()

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
        <div className="ml-2 h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <span className="ml-2 text-sm text-gray-400">Misafir</span>
      </div>
    )
  }

  // İlk harfi al (profil resmi yoksa)
  const initial = user.firstName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center">
      {user.photoUrl ? (
        <img
          src={user.photoUrl || "/placeholder.svg"}
          alt={user.firstName}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{initial}</span>
        </div>
      )}
      <span className="ml-2 font-medium truncate max-w-[100px]">
        {user.firstName} {user.lastName ? user.lastName.charAt(0) + "." : ""}
      </span>
    </div>
  )
}
