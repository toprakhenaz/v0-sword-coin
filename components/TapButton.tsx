"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function TapButton({
  onClick,
  isAnimating,
}: {
  onClick: () => void
  isAnimating: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg transform transition-transform ${
        isAnimating ? "scale-95" : "hover:scale-105"
      }`}
    >
      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-inner">
        <FontAwesomeIcon icon={icons.handPointer} className="text-white text-4xl" />
      </div>
    </button>
  )
}
