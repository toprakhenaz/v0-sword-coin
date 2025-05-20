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
        return { bgColor: "#6366F1", icon: icons.sword }
      default:
        return { bgColor: "#6366F1", icon: icons.globe }
    }
  }

  const platformStyle = getPlatformStyle()

  return (
    <motion.div
      className={`bg-gray-800/90 rounded-xl overflow-hidden ${isCompleted ? "opacity-70" : ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="p-4 flex items-center">
        {/* Platform icon - no frame, just the icon with background */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 mr-4 flex items-center justify-center"
          style={{ backgroundColor: platformStyle.bgColor }}
        >
          {platformLogo ? (
            <img
              src={`/platform-logos/${platform.toLowerCase()}.png`}
              alt={platform}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <FontAwesomeIcon icon={platformStyle.icon} className="text-white text-xl" />
          )}
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-1">{description}</p>

          {/* Reward */}
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
            <span className="text-yellow-300 font-bold text-sm">+{reward.toLocaleString()}</span>
          </div>
        </div>

        {/* Right arrow */}
        <ChevronRight className="text-gray-400 ml-2 flex-shrink-0" size={20} />
      </div>
    </motion.div>
  )
}
