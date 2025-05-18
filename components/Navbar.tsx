"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faUserGroup, faSwords, faCoins, faGem } from "@fortawesome/free-solid-svg-icons"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2">
      <div className="flex justify-between rounded-3xl bg-gray-800 bg-opacity-95 p-2 shadow-lg border border-gray-700 backdrop-blur-sm">
        <NavbarButton href="/" icon={faHome} label="Home" active={pathname === "/"} />
        <NavbarButton href="/friends" icon={faUserGroup} label="Friends" active={pathname === "/friends"} />
        <NavbarButton href="/mine" icon={faSwords} label="Mine" active={pathname === "/mine"} />
        <NavbarButton href="/earn" icon={faCoins} label="Earn" active={pathname === "/earn"} />
        <NavbarButton href="/upgrade" icon={faGem} label="Upgrade" active={pathname === "/upgrade"} />
      </div>
    </div>
  )
}

function NavbarButton({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: any
  label: string
  active: boolean
}) {
  return (
    <Link href={href}>
      <div
        className={`bottom-nav-button w-16 h-16 rounded-xl flex flex-col items-center justify-center 
        transform transition-all duration-300 ${
          active ? "bg-gray-700 scale-105 shadow-inner border border-gray-600" : "hover:bg-gray-700/50"
        }`}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 mb-1 rounded-full
            ${active ? "bg-gradient-to-br from-yellow-500 to-yellow-700" : "bg-transparent"}`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`text-xl ${active ? "text-white animate-pulse" : "text-yellow-400"}`}
            style={{ filter: active ? "drop-shadow(0 0 5px rgba(255, 215, 0, 0.7))" : "none" }}
          />
        </div>
        <span className={`text-xs font-medium ${active ? "text-yellow-300" : "text-gray-300"}`}>{label}</span>
      </div>
    </Link>
  )
}
