"use client"

import { usePathname } from "next/navigation"
import NavbarButton from "./NavbarButton"
import { icons } from "@/icons"
import { useEffect, useState } from "react"
import { useLeagueData } from "@/data/GeneralData"

export default function Navbar() {
  const pathname = usePathname()
  const [prevPath, setPrevPath] = useState(pathname)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the navbar

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
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2">
      <div
        className={`flex justify-between rounded-3xl p-2 backdrop-blur-sm transition-all duration-500 ${
          isTransitioning ? "opacity-70 transform scale-98" : "opacity-100 transform scale-100"
        }`}
        style={{
          background: `linear-gradient(to bottom, rgba(20, 20, 30, 0.9), rgba(30, 30, 40, 0.95))`,
          boxShadow: `0 -5px 25px ${colors.glow}30, inset 0 1px 1px rgba(255, 255, 255, 0.1)`,
          border: `1px solid ${colors.secondary}30`,
        }}
      >
        <NavbarButton href="/" icon={icons.home} label="Home" active={pathname === "/"} />
        <NavbarButton href="/friends" icon={icons.userGroup} label="Friends" active={pathname === "/friends"} />
        <NavbarButton href="/mine" icon={icons.pickaxe} label="Mine" active={pathname === "/mine"} />
        <NavbarButton href="/earn" icon={icons.coins} label="Earn" active={pathname === "/earn"} />
      </div>
    </div>
  )
}
