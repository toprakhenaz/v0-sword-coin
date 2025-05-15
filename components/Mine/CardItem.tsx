"use client"

import Image from "next/image"
import { formatNumber } from "@/utils/gameUtils"

interface CardItemProps {
  id: number
  name: string
  image: string
  level: number
  crystals: number
  onClick: () => void
}

export const CardItem = ({ id, name, image, level, crystals, onClick }: CardItemProps) => {
  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
      onClick={onClick}
    >
      <div className="relative">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={120}
          height={120}
          className="w-full h-32 object-contain p-2"
        />

        {level > 0 && (
          <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {level}
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-50">
        <h3 className="text-sm font-medium truncate">{name}</h3>
        <div className="flex items-center mt-1">
          <Image src="/crystal-hd.png" alt="Crystals" width={16} height={16} className="mr-1" />
          <span className="text-xs text-gray-600">{formatNumber(crystals)}/saat</span>
        </div>
      </div>
    </div>
  )
}
