"use client"

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { useState } from "react"
import { useLeagueData } from "@/data/GeneralData"

function NavbarButton({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: IconDefinition
  label: string
  active: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the navbar buttons

  return (
    <Link href={href}>
      <div
        className={`bottom-nav-button w-20 h-16 rounded-xl flex flex-col items-center justify-center 
        transform transition-all duration-500 ${active ? "scale-105 shadow-lg" : "hover:bg-gray-800/30"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: active ? `0 4px 12px ${colors.glow}50` : "none",
          border: active ? `1px solid ${colors.secondary}50` : "none",
          background: active ? `linear-gradient(to bottom, ${colors.primary}30, ${colors.secondary}20)` : "transparent",
        }}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 mb-1 rounded-full transition-all duration-500
            ${
              active
                ? "bg-gradient-to-br from-yellow-500 to-yellow-700"
                : isHovered
                  ? "bg-gradient-to-br from-gray-600 to-gray-700"
                  : "bg-transparent"
            }`}
          style={{
            transform: active || isHovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`text-xl transition-all duration-500 ${active ? "text-white" : "text-yellow-400"}`}
            style={{
              filter: active ? "drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))" : "none",
              transform: active || isHovered ? "scale(1.1)" : "scale(1)",
            }}
          />
        </div>
        <span
          className={`text-xs font-medium transition-all duration-500 ${
            active ? "text-yellow-300" : isHovered ? "text-gray-200" : "text-gray-300"
          }`}
          style={{
            transform: active || isHovered ? "translateY(2px)" : "translateY(0)",
          }}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

export default NavbarButton
