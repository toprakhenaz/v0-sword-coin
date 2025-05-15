import { Card, CardContent } from "./Earn/EarnCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"

export default function HeaderCard({ coins, crystals }: { coins?: number; crystals?: number }) {
  return (
    <Card className="bg-gray-800 mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-2xl" />
            <span className="text-2xl font-bold">{coins}</span>
          </div>
          <div className="flex items-center ">
            <Image
              src="/crystal.png"
              alt="Gem Icon"
              width={24} // Adjust the width
              height={24} // Adjust the height
            />
            <span className="font-semibold text-2xl ml-1">{crystals}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
