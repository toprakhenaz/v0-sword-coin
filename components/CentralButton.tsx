"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useLeagueData } from "@/data/GeneralData"
import type { CentralButtonProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

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

  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Calculate ripple position relative to button
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipplePosition({ x, y })
    setShowRipple(true)
    setIsPressed(true)

    // Create 3-6 floating numbers
    const numCount = Math.floor(Math.random() * 4) + 3
    const newNumbers: FloatingNumber[] = []

    for (let i = 0; i < numCount; i++) {
      // Random position around the button center
      const angle = Math.random() * Math.PI * 2
      const distance = 20 + Math.random() * 30
      newNumbers.push({
        id: nextId + i,
        value: 6, // This should be the earnPerTap value
        x: 50 + Math.cos(angle) * distance, // percentage from center
        y: 50 + Math.sin(angle) * distance, // percentage from center
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4,
        rotation: -15 + Math.random() * 30,
      })
    }

    setFloatingNumbers((prev) => [...prev, ...newNumbers])
    setNextId(nextId + numCount)

    onClick()

    // Automatically reset pressed state after animation
    setTimeout(() => {
      setIsPressed(false)
      setShowRipple(false)
    }, 300)
  }

  return (
    <div className="flex items-center justify-center relative">
      {/* Pulsating ring animation */}
      <div
        className="absolute w-56 h-56 rounded-full opacity-20 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
        }}
      ></div>
      <div
        className="absolute w-52 h-52 rounded-full opacity-15 animate-pulse"
        style={{
          animationDelay: "0.5s",
          background: `radial-gradient(circle, ${colors.secondary}, ${colors.primary})`,
        }}
      ></div>

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
        className="relative overflow-hidden z-10"
        onClick={handleButtonPress}
        style={{
          width: "13rem",
          height: "13rem",
          borderRadius: "50%",
          border: `8px solid ${colors.secondary}`,
          background: `linear-gradient(135deg, ${colors.secondary}80, ${colors.primary})`,
          boxShadow: isPressed
            ? `0 0 25px ${colors.glow}, inset 0 0 20px rgba(255, 255, 255, 0.5)`
            : `0 0 15px ${colors.glow}, inset 0 0 10px rgba(255, 255, 255, 0.3)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.3s ease",
          transform: isPressed ? "scale(0.9)" : "scale(1)",
        }}
      >
        {/* Ripple effect */}
        {showRipple && (
          <span
            className="absolute bg-white rounded-full opacity-30 animate-ripple"
            style={{
              top: ripplePosition.y,
              left: ripplePosition.x,
              width: "300px",
              height: "300px",
              marginLeft: "-150px",
              marginTop: "-150px",
            }}
          />
        )}

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
            width={200}
            height={200}
            priority
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
            }}
          />
        </div>
      </button>
    </div>
  )
}
