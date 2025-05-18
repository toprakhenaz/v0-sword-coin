"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: Date
  title: string
  price?: string | null
}

export default function CountdownTimer({ targetDate, title, price }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date()
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return timeLeft
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearTimeout(timer)
  })

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
      <div className="flex justify-center space-x-4 mb-4">
        <div className="text-center">
          <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {timeLeft.days}
          </div>
          <div className="text-xs mt-1">Days</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {timeLeft.hours}
          </div>
          <div className="text-xs mt-1">Hours</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {timeLeft.minutes}
          </div>
          <div className="text-xs mt-1">Minutes</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-900 rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {timeLeft.seconds}
          </div>
          <div className="text-xs mt-1">Seconds</div>
        </div>
      </div>
      <div className="text-center">
        <span className="text-lg font-bold">Listing Price: </span>
        <span className="text-xl font-bold text-yellow-400">{price ? `$${price}` : "?"}</span>
      </div>
    </div>
  )
}
