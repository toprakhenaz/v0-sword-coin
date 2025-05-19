"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { motion } from "framer-motion"

interface TaskCategoryProps {
  categories: string[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function TaskCategory({ categories, activeCategory, setActiveCategory }: TaskCategoryProps) {
  return (
    <motion.div
      className="mb-4 overflow-x-auto scrollbar-hide"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-2 p-1">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeCategory === category
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 hover:text-white"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {getCategoryIcon(category)}
            <span className="ml-1">{category}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "All":
      return <FontAwesomeIcon icon={icons.star} className="text-xs" />
    case "Daily":
      return <FontAwesomeIcon icon={icons.clock} className="text-xs" />
    case "Crypto":
      return <FontAwesomeIcon icon={icons.coins} className="text-xs" />
    case "Social":
      return <FontAwesomeIcon icon={icons.userGroup} className="text-xs" />
    case "Learn":
      return <FontAwesomeIcon icon={icons.infoCircle} className="text-xs" />
    default:
      return <FontAwesomeIcon icon={icons.star} className="text-xs" />
  }
}
