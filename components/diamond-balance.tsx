"use client"

import { useState, useEffect } from "react"
import DiamondIcon from "./diamond-icon"

interface DiamondBalanceProps {
  diamonds?: number
}

export default function DiamondBalance({ diamonds = 0 }: DiamondBalanceProps) {
  const [count, setCount] = useState(diamonds)

  useEffect(() => {
    // Gerçek uygulamada elmas sayısını güncellemek için bir API çağrısı yapılabilir
    setCount(diamonds)
  }, [diamonds])

  return (
    <div className="bg-gradient-to-r from-[#1a2235] to-[#1e2738] rounded-xl p-4 mx-4 my-4 flex justify-between items-center shadow-lg border border-gray-800/50">
      <div className="flex items-center">
        <div className="relative">
          <DiamondIcon
            size={28}
            color="#60a5fa"
            secondaryColor="#2563eb"
            className="absolute -top-1 -left-1 animate-pulse"
          />
          <DiamondIcon size={28} color="#60a5fa" secondaryColor="#2563eb" />
        </div>
        <span className="text-2xl font-bold ml-2 text-blue-400">{count.toLocaleString()}</span>
      </div>
      <div className="bg-[#1e2738]/70 px-3 py-1 rounded-full">
        <span className="font-bold text-blue-400">Premium</span>
      </div>
    </div>
  )
}
