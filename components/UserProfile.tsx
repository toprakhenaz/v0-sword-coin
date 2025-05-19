"use client"

import { useUser } from "@/context/UserContext"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function UserProfile() {
  const { telegramUser, username, logout } = useUser()

  // If no user data, don't render anything
  if (!telegramUser && !username) return null

  return (
    <div className="bg-gray-800/60 py-3 px-4 mb-4 rounded-lg flex items-center justify-between shadow-lg backdrop-blur-sm border border-gray-700/70">
      <div className="flex items-center">
        {telegramUser && telegramUser.photo_url ? (
          <Image
            src={telegramUser.photo_url || "/placeholder.svg"}
            alt={telegramUser.first_name}
            width={40}
            height={40}
            className="rounded-full mr-3 border-2 border-blue-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold">
              {telegramUser ? telegramUser.first_name.charAt(0) : username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="font-bold text-white">
            {telegramUser ? (
              <>
                {telegramUser.first_name} {telegramUser.last_name || ""}
              </>
            ) : (
              username
            )}
          </div>
          {telegramUser && telegramUser.username && (
            <div className="text-xs text-gray-300">@{telegramUser.username}</div>
          )}
          {!telegramUser && <div className="text-xs text-gray-300">Misafir Kullanıcı</div>}
        </div>
      </div>

      <button
        onClick={logout}
        className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
      >
        <FontAwesomeIcon icon={icons.times} />
      </button>
    </div>
  )
}
