"use client"

import { usePathname, useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUsers,
  faSwords,
  faTasks,
  faChartLine,
  faSignOutAlt,
  faCog,
  faTrophy,
  faUserSlash,
  faGem,
} from "@fortawesome/free-solid-svg-icons"
import { getSupabaseClient } from "@/lib/supabase"
import Image from "next/image"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/admin")
  }

  const navItems = [
    { href: "/admin/dashboard", icon: faChartLine, label: "Dashboard" },
    { href: "/admin/users", icon: faUsers, label: "Users" },
    { href: "/admin/cards", icon: faSwords, label: "Cards" },
    { href: "/admin/missions", icon: faTasks, label: "Missions" },
    { href: "/admin/leagues", icon: faTrophy, label: "Leagues" },
    { href: "/admin/bans", icon: faUserSlash, label: "Bans" },
    { href: "/admin/crystals", icon: faGem, label: "Crystals" },
    { href: "/admin/settings", icon: faCog, label: "Settings" },
  ]

  return (
    <div className="w-64 bg-gray-800 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-center">
        <Image src="/sword-logo.png" alt="Sword Coin Logo" width={40} height={40} className="mr-2" />
        <h1 className="text-xl font-bold">Sword Coin Admin</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-3 w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
