"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useUser } from "@/app/context/UserContext"
import { toast } from "@/components/ui/use-toast"
import { playTapSound } from "@/lib/sounds"

export default function CentralButton() {
  const { user, addCoins, updateUser } = useUser()
  const [isPressed, setIsPressed] = useState(false)
  const [coinAnimation, setCoinAnimation] = useState<{ id: number; value: number }[]>([])
  const [animationId, setAnimationId] = useState(0)

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleClick = () => {
    if (!user) return
    if (user.energy <= 0) {
      toast({
        title: "No Energy",
        description: "You don't have enough energy to mine. Wait for it to recharge or boost it.",
        variant: "destructive",
      })
      return
    }

    // Play sound
    playTapSound()

    // Add coins
    addCoins(user.earnPerTap)

    // Reduce energy
    updateUser({ energy: user.energy - 1 })

    // Add coin animation
    const newId = animationId + 1
    setAnimationId(newId)
    setCoinAnimation((prev) => [...prev, { id: newId, value: user.earnPerTap }])

    // Remove animation after it completes
    setTimeout(() => {
      setCoinAnimation((prev) => prev.filter((anim) => anim.id !== newId))
    }, 1000)
  }

  // Energy regeneration
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      if (user.energy < user.maxEnergy) {
        updateUser({ energy: Math.min(user.energy + 1, user.maxEnergy) })
      }
    }, 60000) // Regenerate 1 energy per minute

    return () => clearInterval(interval)
  }, [user, updateUser])

  return (
    <div className="flex items-center justify-center relative">
      {/* Outer pulse effect */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 animate-pulse"></div>

      {/* Inner pulse effect */}
      <div
        className="absolute w-56 h-56 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* Button with hamster image */}
      <button
        className={`central-button ${isPressed ? "scale-95" : ""}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{
          width: "15rem",
          height: "15rem",
          borderRadius: "50%",
          overflow: "hidden",
          border: "8px solid rgba(255, 69, 0, 0.7)",
          background: "linear-gradient(135deg, rgba(255, 140, 0, 0.5), rgba(255, 0, 0, 0.5))",
          boxShadow: isPressed
            ? "0 0 25px rgba(255, 69, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.5)"
            : "0 0 15px rgba(255, 69, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.2s ease",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className={`transform transition-all duration-200 ${isPressed ? "scale-90" : "scale-100"}`}>
          <Image
            src="/hamster.png"
            alt="Hamster"
            width={180}
            height={180}
            className={`drop-shadow-2xl ${isPressed ? "rotate-12" : ""}`}
            style={{ transition: "all 0.2s ease" }}
          />
        </div>
      </button>

      {/* Coin animations */}
      {coinAnimation.map((anim) => (
        <div
          key={anim.id}
          className="absolute text-yellow-400 font-bold text-xl animate-riseAndFade"
          style={{ left: "50%", bottom: "50%" }}
        >
          +{anim.value}
        </div>
      ))}

      {/* Highlights */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white rounded-full opacity-30 blur-sm"></div>
    </div>
  )
}
