"use client"

import Image from "next/image"
import type { CentralButtonProps } from "@/types"
import { useState } from "react"
import { playTapSound } from "@/utils/soundEffects"

export default function CentralButton({ onClick, league }: CentralButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleClick = () => {
    playTapSound()
    onClick()
  }

  return (
    <div className="flex items-center justify-center relative">
      {/* Outer pulse effect */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 animate-pulse"></div>

      {/* Inner pulse effect */}
      <div
        className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* Button with sword image */}
      <button
        className={`central-button ${isPressed ? "scale-95" : ""}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <div className={`transform transition-all duration-200 ${isPressed ? "scale-90" : "scale-100"}`}>
          <Image
            src={`/leagues/league-${league}.png`}
            alt={`League ${league}`}
            width={180}
            height={180}
            className={`drop-shadow-2xl ${isPressed ? "rotate-12" : ""}`}
            style={{ transition: "all 0.2s ease" }}
          />
        </div>
      </button>

      {/* Highlights */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white rounded-full opacity-30 blur-sm"></div>
    </div>
  )
}
