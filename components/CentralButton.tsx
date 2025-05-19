"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useLeagueData } from "@/data/GeneralData"
import type { CentralButtonProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useUser } from "@/context/UserContext"

interface FloatingNumber {
  id: number
  value: number
  x: number
  y: number
  opacity: number
  scale: number
  rotation: number
}

export default function CentralButton({ onClick, league }: CentralButtonProps) {
  const { earnPerTap } = useUser()
  const [isPressed, setIsPressed] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([])
  const [nextId, setNextId] = useState(0)
  const { getLeagueImage, getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)

  // Clean up old floating numbers
  useEffect(() => {
    const timer = setInterval(() => {
      setFloatingNumbers((prev) => prev.filter((num) => num.opacity > 0))
    }, 100)

    return () => clearInterval(timer)
  }, [])

  // Update the floating numbers logic to only show one symbol per click
  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If we're already showing effects, don't trigger again too quickly
    if (showRipple) return

    // Calculate ripple position relative to button
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipplePosition({ x, y })
    setShowRipple(true)
    setIsPressed(true)

    // Call the onClick handler passed from parent
    onClick()

    // Create just one floating number
    const angle = Math.random() * Math.PI * 2
    const distance = 20 + Math.random() * 40
    const newNumber = {
      id: nextId,
      value: earnPerTap, // Use earnPerTap directly from context
      x: 50 + Math.cos(angle) * distance, // percentage from center
      y: 50 + Math.sin(angle) * distance, // percentage from center
      opacity: 1,
      scale: 1,
      rotation: 0,
    }

    setFloatingNumbers([...floatingNumbers, newNumber])
    setNextId(nextId + 1)

    // Automatically reset pressed state after animation
    setTimeout(() => {
      setIsPressed(false)
      setShowRipple(false)
    }, 300)
  }

  return (
    <div className="flex items-center justify-center relative">
      {/* Pulsating rings animation */}
      <div
        className="absolute w-60 h-60 rounded-full opacity-20 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.primary}80, ${colors.primary}20)`,
          animationDuration: "3s",
          transition: "background 0.5s ease",
        }}
      ></div>
      <div
        className="absolute w-52 h-52 rounded-full opacity-15 animate-pulse"
        style={{
          animationDelay: "1.5s",
          animationDuration: "2.5s",
          background: `radial-gradient(circle, ${colors.primary}60, ${colors.primary}10)`,
          transition: "background 0.5s ease",
        }}
      ></div>

      {/* Particles around the button */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 140 + Math.sin(Date.now() / 1000 + i) * 10
        const size = 2 + Math.random() * 4
        return (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `calc(50% + ${Math.cos(angle) * radius}px)`,
              top: `calc(50% + ${Math.sin(angle) * radius}px)`,
              background: `${colors.primary}`,
              boxShadow: `0 0 10px ${colors.glow}`,
              animationDuration: `${2 + (i % 3)}s`,
              zIndex: 5,
              transition: "background 0.5s ease, box-shadow 0.5s ease",
            }}
          />
        )
      })}

      {/* Floating numbers */}
      {floatingNumbers.map((num) => (
        <div
          key={num.id}
          className="absolute pointer-events-none flex items-center z-20"
          style={{
            left: `${num.x}%`,
            top: `${num.y}%`,
            opacity: num.opacity,
            transform: `scale(${num.scale}) rotate(${num.rotation}deg)`,
            transition: "all 0.8s ease-out",
            animation: "floatUp 1s forwards ease-out",
          }}
          onAnimationEnd={() => {
            setFloatingNumbers((prev) => prev.map((n) => (n.id === num.id ? { ...n, opacity: 0 } : n)))
          }}
        >
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
          <span className="text-yellow-300 font-bold text-lg">+{num.value}</span>
        </div>
      ))}

      <button
        className="relative overflow-hidden z-10 outline-none focus:outline-none"
        onClick={handleButtonPress}
        style={{
          width: "14rem",
          height: "14rem",
          borderRadius: "50%",
          border: `8px solid ${colors.primary}`,
          background: `radial-gradient(circle, ${colors.primary}80, ${colors.primary})`,
          boxShadow: isPressed
            ? `0 0 30px ${colors.glow}, inset 0 0 25px rgba(255, 255, 255, 0.6)`
            : `0 0 20px ${colors.glow}, inset 0 0 15px rgba(255, 255, 255, 0.4)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.3s ease, background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
          transform: isPressed ? "scale(0.9)" : "scale(1)",
        }}
      >
        {/* Ripple effect - changed to match button color instead of white */}
        {showRipple && (
          <span
            className="absolute rounded-full opacity-40 animate-ripple"
            style={{
              top: ripplePosition.y,
              left: ripplePosition.x,
              width: "300px",
              height: "300px",
              marginLeft: "-150px",
              marginTop: "-150px",
              background: colors.primary,
            }}
          />
        )}

        {/* Button inner glow - using primary color instead of secondary */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.primary}30, transparent 70%)`,
            opacity: isPressed ? 0.8 : 0.5,
            transition: "background 0.5s ease",
          }}
        />

        {/* Button content */}
        <div
          className="relative z-10 transform transition-transform duration-300"
          style={{
            transform: isPressed ? "scale(0.95)" : "scale(1)",
          }}
        >
          <Image
            src={getLeagueImage(league) || "/placeholder.svg"}
            alt={`League ${league}`}
            width={180}
            height={180}
            priority
            className="drop-shadow-lg animate-pulse"
            style={{
              filter: `drop-shadow(0 0 10px ${colors.glow})`,
              animationDuration: "3s",
              transition: "filter 0.5s ease",
            }}
          />
        </div>
      </button>
    </div>
  )
}
