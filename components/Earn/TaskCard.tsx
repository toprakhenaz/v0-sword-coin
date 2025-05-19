"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { motion } from "framer-motion"
import Image from "next/image"

interface TaskCardProps {
  title: string
  description: string
  reward: number
  platform: string
  platformLogo: string
  progress: number
  isCompleted: boolean
  onClick: () => void
}

export default function TaskCard({
  title,
  description,
  reward,
  platform,
  platformLogo,
  progress,
  isCompleted,
  onClick,
}: TaskCardProps) {
  return (
    <motion.div
      className={`bg-gray-800/70 rounded-xl overflow-hidden h-full border border-gray-700/50 ${
        isCompleted ? "opacity-70" : ""
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-gray-700/50 flex items-center justify-center">
            <Image
              src={platformLogo || "/placeholder.svg"}
              alt={platform}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-white text-sm truncate">{title}</h3>
              <div className="flex items-center ml-2 flex-shrink-0">
                <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                <span className="text-yellow-300 font-bold text-sm">{reward}</span>
              </div>
            </div>
            <p className="text-gray-300 text-xs line-clamp-2 mt-1">{description}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 relative h-1.5 bg-gray-700/70 rounded-full overflow-hidden">
          <div
            className="absolute h-full left-0 top-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 animate-shine"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-3">
          <div className="text-xs text-gray-400">
            <span className="text-gray-300 font-medium">{platform}</span> • {progress}% complete
          </div>
          <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted
                ? "bg-gray-600 text-gray-300"
                : progress === 100
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            }`}
            disabled={isCompleted}
          >
            {isCompleted ? "Completed" : progress === 100 ? "Claim" : "Start"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
