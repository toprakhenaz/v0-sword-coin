"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"

interface PopupProps {
  title: string
  message: string
  image: string
  onClose: () => void
}

export default function Popup({ title, message, image, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the popup

  // Animation for entrance
  useEffect(() => {
    // Slight delay before showing for smoother animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    // ESC key functionality
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual close to allow animation to complete
    setTimeout(onClose, 300)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 transition-all duration-300 backdrop-blur-sm"
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        className="rounded-2xl p-6 shadow-2xl relative w-[90%] max-w-sm text-center transform transition-transform duration-300"
        style={{
          background: `linear-gradient(to bottom, ${colors.primary}90, ${colors.secondary}70)`,
          border: `1px solid ${colors.secondary}`,
          boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3), 0 0 15px ${colors.glow}`,
          transform: isVisible ? "scale(1)" : "scale(0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-300 text-gray-300 hover:text-white"
        >
          <FontAwesomeIcon icon={icons.times} />
        </button>

        <div className="mb-2 mx-auto w-20 h-1 bg-gray-700 rounded-full"></div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
          {title}
        </h2>
        <p className="mb-4 text-gray-200">{message}</p>

        <div className="relative mb-5 p-2">
          <div
            className="absolute inset-0 rounded-xl animate-pulse"
            style={{
              background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}40, ${colors.primary}40)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite linear",
            }}
          ></div>
          <img
            src={image || "/placeholder.svg"}
            alt="Popup Image"
            className="mx-auto w-32 h-32 object-contain relative z-10 animate-bounce-slow"
            style={{ animationDuration: "3s" }}
          />
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 px-4 text-white font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:-translate-y-1 active:translate-y-0"
          style={{
            background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
            boxShadow: `0 4px 12px ${colors.glow}`,
          }}
        >
          Tamam
        </button>
      </div>
    </div>
  )
}
