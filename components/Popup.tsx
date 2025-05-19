"use client"

import type React from "react"

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

    // Auto close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, 5000)

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      clearTimeout(timer)
      clearTimeout(autoCloseTimer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual close to allow animation to complete
    setTimeout(onClose, 300)
  }

  // Handle touch events
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-all duration-300 backdrop-blur-sm"
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="rounded-2xl p-6 shadow-2xl relative w-[90%] max-w-sm text-center transform transition-transform duration-300"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}90, ${colors.secondary}70)`,
          border: `2px solid ${colors.secondary}`,
          boxShadow: `0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 8px 20px -6px rgba(0, 0, 0, 0.4), 0 0 15px ${colors.glow}`,
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-800/70 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300 text-gray-300 hover:text-white"
        >
          <FontAwesomeIcon icon={icons.times} />
        </button>

        <div className="mb-2 mx-auto w-20 h-1 bg-white/20 rounded-full"></div>

        <h2
          className="text-2xl font-bold mb-3 relative inline-block"
          style={{
            color: colors.text,
            textShadow: `0 2px 10px ${colors.glow}`,
          }}
        >
          {title}
          <span
            className="absolute left-0 right-0 h-0.5 bottom-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          ></span>
        </h2>
        <p className="mb-6 text-gray-100">{message}</p>

        <div className="relative mb-6 p-3">
          <div
            className="absolute inset-0 rounded-xl opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.secondary}60, transparent 70%)`,
              animationDuration: "2s",
            }}
          ></div>
          {image === "/coin.png" ? (
            <div className="flex flex-col items-center justify-center">
              <FontAwesomeIcon
                icon={icons.coins}
                className="text-yellow-300 text-6xl mb-2 animate-pulse"
                style={{
                  animationDuration: "3s",
                  filter: `drop-shadow(0 0 10px ${colors.glow})`,
                }}
              />
              <div className="text-2xl font-bold text-yellow-300">+{message.match(/\d[\d,.]*\s*coins/)?.[0] || ""}</div>
            </div>
          ) : (
            <img
              src={image || "/placeholder.svg"}
              alt="Popup Image"
              className="mx-auto w-36 h-36 object-contain relative z-10 animate-pulse"
              style={{
                animationDuration: "3s",
                filter: `drop-shadow(0 0 10px ${colors.glow})`,
              }}
            />
          )}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 px-4 text-white font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 tap-feedback"
          style={{
            background: `linear-gradient(to right, ${colors.secondary}, ${colors.primary})`,
            boxShadow: `0 4px 12px ${colors.glow}, 0 2px 6px rgba(0, 0, 0, 0.3)`,
          }}
        >
          Awesome!
        </button>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => {
          const size = 2 + Math.random() * 4
          const angle = Math.random() * Math.PI * 2
          const distance = 30 + Math.random() * 100
          const duration = 3 + Math.random() * 5
          const delay = Math.random() * 2

          return (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                background: i % 2 === 0 ? colors.primary : colors.secondary,
                boxShadow: `0 0 5px ${colors.glow}`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
