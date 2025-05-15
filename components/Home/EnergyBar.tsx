"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBolt, faRocket } from "@fortawesome/free-solid-svg-icons"
import type { EnergyBarProps } from "@/types"
import { useState } from "react"
import Image from "next/image"

export default function EnergyBar({ energy, maxEnergy, boost }: EnergyBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const percentage = (energy / maxEnergy) * 100

  const handleBoostClick = () => {
    setIsAnimating(true)
    boost()
    setTimeout(() => setIsAnimating(false), 1000)
  }

  return (
    <div className="flex items-center space-x-4 px-2">
      <div className="flex-grow space-y-2">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-blue-400">Energy</span>
          <span className="text-white">
            <span className={percentage < 30 ? "text-red-500" : "text-blue-400"}>{energy}</span> / {maxEnergy}
          </span>
        </div>

        <div
          className="h-7 rounded-full overflow-hidden relative shadow-lg"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, 
                ${percentage < 30 ? "#FF4136" : "#2196F3"}, 
                ${percentage < 30 ? "#FF851B" : "#03A9F4"})`,
              boxShadow: `0 0 15px ${percentage < 30 ? "rgba(255, 69, 0, 0.7)" : "rgba(33, 150, 243, 0.7)"}`,
            }}
          ></div>

          <div className="absolute inset-0 flex items-center px-4">
            <div className="w-full bg-gradient-to-r from-transparent via-white to-transparent h-px opacity-30"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faBolt}
              className={`${percentage < 30 ? "text-red-300" : "text-blue-300"} text-lg`}
              beat={percentage < 30}
            />
          </div>
        </div>
      </div>

      <button
        className={`w-14 h-14 rounded-full text-white font-bold shadow-lg flex items-center justify-center transform transition-all duration-300
          ${isAnimating ? "scale-90" : "hover:scale-110"}`}
        style={{
          background: "linear-gradient(135deg, #9C27B0, #E91E63)",
          boxShadow: isAnimating ? "0 0 20px rgba(233, 30, 99, 0.7)" : "0 0 10px rgba(233, 30, 99, 0.5)",
        }}
        onClick={handleBoostClick}
      >
        <FontAwesomeIcon
          icon={faRocket}
          className={`text-2xl ${isAnimating ? "animate-ping" : ""}`}
          spin={isAnimating}
        />
      </button>
    </div>
  )
}
