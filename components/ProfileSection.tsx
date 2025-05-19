"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useUser } from "@/context/UserContext"

export default function ProfileSection() {
  const { username, telegramId, coins, league, logout } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 bg-gray-800 rounded-full px-3 py-2 hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{username?.charAt(0) || "U"}</span>
        </div>
        <span className="text-white">{username || "User"}</span>
        <FontAwesomeIcon icon={isMenuOpen ? icons.chevronUp : icons.chevronDown} className="text-gray-400 text-xs" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="text-white font-bold">{username}</div>
            <div className="text-gray-400 text-sm">ID: {telegramId}</div>
          </div>
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Coins:</span>
              <span className="text-yellow-400 font-bold">{coins.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">League:</span>
              <span className="text-white">{league}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full p-4 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={icons.times} className="mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
