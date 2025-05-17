"use client"

import type React from "react"

import { Share2 } from "lucide-react"
import { shareToTelegram } from "@/lib/telegram-share"
import { useState } from "react"

interface ShareButtonProps {
  message?: string
  url?: string
  className?: string
  children?: React.ReactNode
}

export default function ShareButton({ message, url, className, children }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = () => {
    setIsSharing(true)

    const defaultMessage = "Sword Coin'de tap-to-earn ile coin kazanıyorum! Sen de katıl!"

    try {
      shareToTelegram(message || defaultMessage, url)
    } catch (error) {
      console.error("Paylaşım hatası:", error)
    } finally {
      setTimeout(() => setIsSharing(false), 1000)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center justify-center ${className || "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"}`}
    >
      {isSharing ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Paylaşılıyor...
        </span>
      ) : (
        <>
          {children || (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Paylaş
            </>
          )}
        </>
      )}
    </button>
  )
}
