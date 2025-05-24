"use client"

import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { ChevronRight } from "lucide-react"

interface TaskCardProps {
  title: string
  description: string
  reward: number
  platform: string
  platformLogo: string
  progress: number
  isCompleted: boolean
  taskUrl?: string
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
  taskUrl,
  onClick,
}: TaskCardProps) {
  // Get platform icon and color
  const getPlatformStyle = () => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return { bgColor: "#FF0000", icon: icons.youtube }
      case "twitter":
        return { bgColor: "#000000", icon: icons.twitter }
      case "telegram":
        return { bgColor: "#0088cc", icon: icons.telegram }
      case "instagram":
        return { bgColor: "#E1306C", icon: icons.instagram }
      case "facebook":
        return { bgColor: "#1877F2", icon: icons.facebook }
      case "linkedin":
        return { bgColor: "#0077B5", icon: icons.linkedin }
      case "binance":
        return { bgColor: "#F0B90B", icon: icons.coins }
      case "swordcoin":
        return { bgColor: "#6366F1", icon: icons.swords }
      default:
        return { bgColor: "#6366F1", icon: icons.globe }
    }
  }

  const platformStyle = getPlatformStyle()

  const handleClick = () => {
    // If task has URL and is not completed, open the URL
    if (taskUrl && !isCompleted && progress < 100) {
      window.open(taskUrl, '_blank')
    }
    onClick()
  }

  // Get button text and style based on task state
  const getButtonContent = () => {
    if (isCompleted) {
      return {
        element: (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={icons.check} className="text-white text-sm" />
          </div>
        )
      }
    } else if (progress === 100) {
      return {
        element: (
          <div className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold">
            Claim
          </div>
        )
      }
    } else if (progress > 0) {
      return {
        element: (
          <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
            Verify
          </div>
        )
      }
    } else {
      return {
        element: <ChevronRight className="text-gray-400" size={20} />
      }
    }
  }

  return (
    <motion.div
      className={`bg-gray-800/90 rounded-xl overflow-hidden cursor-pointer ${isCompleted ? "opacity-70" : ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      <div className="p-4 flex items-center">
        {/* Platform icon */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 mr-4 flex items-center justify-center"
          style={{ backgroundColor: platformStyle.bgColor }}
        >
          {platformLogo ? (
            <img
              src={`/platform-logos/${platform.toLowerCase()}.png`}
              alt={platform}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to FontAwesome icon if image fails to load
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block')
              }}
            />
          ) : null}
          <FontAwesomeIcon 
            icon={platformStyle.icon} 
            className="text-white text-xl" 
            style={{ display: platformLogo ? 'none' : 'block' }}
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-1">{description}</p>

          {/* Reward */}
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
            <span className="text-yellow-300 font-bold text-sm">+{reward.toLocaleString()}</span>
          </div>

          {/* Progress bar */}
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Status text */}
          {isCompleted && (
            <div className="flex items-center text-green-400 text-xs">
              <FontAwesomeIcon icon={icons.check} className="mr-1" />
              <span>Completed</span>
            </div>
          )}
          {progress === 100 && !isCompleted && (
            <div className="flex items-center text-yellow-400 text-xs">
              <FontAwesomeIcon icon={icons.gift} className="mr-1" />
              <span>Ready to claim</span>
            </div>
          )}
          {progress > 0 && progress < 100 && (
            <div className="flex items-center text-blue-400 text-xs">
              <FontAwesomeIcon icon={icons.clock} className="mr-1" />
              <span>In progress ({progress}%)</span>
            </div>
          )}
        </div>

        {/* Action button or status */}
        <div className="ml-2 flex-shrink-0">
          {getButtonContent().element}
        </div>
      </div>
    </motion.div>
  )
}