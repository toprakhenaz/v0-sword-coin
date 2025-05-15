"use client"

import { usePathname, useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faUserGroup, faSwords, faRocket } from "@fortawesome/free-solid-svg-icons"

// Default export'u kaldırıp named export ekleyelim
export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: "/", icon: faHome, label: "Home" },
    { href: "/friends", icon: faUserGroup, label: "Friends" },
    { href: "/mine", icon: faSwords, label: "Mine" },
    { href: "/boost", icon: faRocket, label: "Boost" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2">
      <div className="flex justify-between rounded-3xl bg-gray-800 bg-opacity-95 p-2 shadow-lg border border-gray-700 backdrop-blur-sm">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`bottom-nav-button w-20 h-16 rounded-xl flex flex-col items-center justify-center 
            transform transition-all duration-300 ${
              pathname === item.href
                ? "bg-gray-700 scale-105 shadow-inner border border-gray-600"
                : "hover:bg-gray-700/50"
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 mb-1 rounded-full
                ${pathname === item.href ? "bg-gradient-to-br from-yellow-500 to-yellow-700" : "bg-transparent"}`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`text-xl ${pathname === item.href ? "text-white animate-pulse" : "text-yellow-400"}`}
                style={{ filter: pathname === item.href ? "drop-shadow(0 0 5px rgba(255, 215, 0, 0.7))" : "none" }}
              />
            </div>
            <span className={`text-xs font-medium ${pathname === item.href ? "text-yellow-300" : "text-gray-300"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Geriye dönük uyumluluk için default export'u da ekleyelim
export default Navbar
