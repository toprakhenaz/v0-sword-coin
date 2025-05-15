"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleDoubleUp } from "@fortawesome/free-solid-svg-icons"
import type { HeaderProps } from "@/types"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function Header({ earnPerTap, coinsToLevelUp, crystals }: HeaderProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [listingPrice, setListingPrice] = useState<string | null>(null)

  // Target date: January 1, 2026, 13:00
  const targetDate = new Date("2026-01-01T13:00:00")

  useEffect(() => {
    // Fetch listing price from admin settings (placeholder)
    const fetchListingPrice = async () => {
      // This would be replaced with an actual API call
      // For now, we'll just use a placeholder
      setListingPrice("?")
    }

    fetchListingPrice()
  }, [])

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="flex flex-row justify-between py-4 px-8 text-xl font-bold shadow-lg rounded-full"
      style={{ background: "linear-gradient(to bottom, #281d8a, #302b63, #24243e)" }}
    >
      <div className="flex flex-col justify-center">
        <p className="text-xs text-purple-500">Crystals</p>
        <div className="flex flex-row">
          <Image src="/crystal.png" alt="Gem Icon" width={24} height={24} />
          <span className="text-xl font-bold text-white ml-1">{crystals}</span>
        </div>
      </div>
      <div className="flex flex-col text-center">
        <p className="text-xs text-green-400">Listing Date: 01.01.2026</p>
        <div className="flex space-x-1 text-sm">
          <div className="bg-gray-700 rounded px-1">
            <span>{countdown.days.toString().padStart(2, "0")}d</span>
          </div>
          <div className="bg-gray-700 rounded px-1">
            <span>{countdown.hours.toString().padStart(2, "0")}h</span>
          </div>
          <div className="bg-gray-700 rounded px-1">
            <span>{countdown.minutes.toString().padStart(2, "0")}m</span>
          </div>
          <div className="bg-gray-700 rounded px-1">
            <span>{countdown.seconds.toString().padStart(2, "0")}s</span>
          </div>
        </div>
        <p className="text-xs text-yellow-400 mt-1">
          Listing Price: <span className="font-bold">${listingPrice}</span>
        </p>
      </div>
      <div className="flex flex-col text-center">
        <p className="text-xs text-yellow-400">Earn per Tap</p>
        <div>
          <FontAwesomeIcon icon={faAngleDoubleUp} className="mr-2" />
          <span>+{earnPerTap}</span>
        </div>
      </div>
    </div>
  )
}
