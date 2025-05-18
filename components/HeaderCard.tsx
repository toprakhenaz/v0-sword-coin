"use client"

import { Card, CardContent } from "./ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { useUser } from "@/app/context/UserContext"
import { formatNumber } from "@/lib/utils"

export default function HeaderCard() {
  const { user } = useUser()

  return (
    <Card className="bg-gray-800 mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-400 mr-2 text-2xl" />
            <span className="text-2xl font-bold">{formatNumber(user?.coins || 0)}</span>
          </div>
          <div className="flex items-center">
            <Image src="/crystal.png" alt="Crystal" width={24} height={24} />
            <span className="font-semibold text-2xl ml-1">{user?.crystals || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
