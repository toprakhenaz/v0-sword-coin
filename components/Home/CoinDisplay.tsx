"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import type { CoinDisplayProps } from "@/types"
import Image from "next/image"

export default function CoinDisplay({ coins, league, onclick }: CoinDisplayProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full py-2 px-4 shadow-md">
        <FontAwesomeIcon icon={faCoins} className="text-yellow-100 mr-2 text-xl" />
        <span className="text-2xl font-bold text-white">{coins.toLocaleString()}</span>
      </div>
      <button
        className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 rounded-full py-2 px-4 shadow-md transform hover:scale-105 transition-transform duration-300"
        onClick={onclick}
      >
        <Image src={`/leagues/league-${league}.png`} alt={`League ${league}`} width={32} height={32} className="mr-2" />
        <span className="text-lg font-semibold whitespace-nowrap text-white">League {league}</span>
        <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-blue-100" />
      </button>
    </div>
  )
}
