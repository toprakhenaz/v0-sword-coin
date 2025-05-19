"use client"

import { usePathname } from "next/navigation"
import NavbarButton from "./NavbarButton"
import { icons } from "@/icons"
import { useEffect, useState } from "react"
import { useLeagueData } from "@/data/GeneralData"
import { useUser } from "@/context/UserContext"

export default function Navbar() {
  const pathname = usePathname()
  const [prevPath, setPrevPath] = useState(pathname)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { league } = useUser()
  const { getLeagueColors } = useLeagueData()
  const leagueColors = getLeagueColors(league)

  // Handle page transitions
  useEffect(() => {
    if (pathname !== prevPath) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setPrevPath(pathname)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, prevPath])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div
        className={`flex justify-between rounded-2xl p-3 bg-[#1A1E2E]/90 backdrop-blur-sm border border-gray-800/30 transition-all duration-500 ${
          isTransitioning ? "opacity-70 transform scale-98" : "opacity-100 transform scale-100"
        }`}
        style={{
          boxShadow: `0 4px 12px ${leagueColors.glow}30`,
          transition: "box-shadow 0.5s ease",
        }}
      >
        <NavbarButton
          href="/"
          icon={icons.home}
          label="Home"
          active={pathname === "/"}
          activeColor={leagueColors.primary}
        />
        <NavbarButton
          href="/friends"
          icon={icons.userGroup}
          label="Friends"
          active={pathname === "/friends"}
          activeColor={leagueColors.primary}
        />
        <NavbarButton
          href="/mine"
          icon={icons.pickaxe}
          label="Mine"
          active={pathname === "/mine"}
          activeColor={leagueColors.primary}
        />
        <NavbarButton
          href="/earn"
          icon={icons.coins}
          label="Earn"
          active={pathname === "/earn"}
          activeColor={leagueColors.primary}
        />
      </div>
    </div>
  )
}
