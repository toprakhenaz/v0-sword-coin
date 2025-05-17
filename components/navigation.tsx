"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sword, Scroll, Trophy, Settings } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom w-full max-w-md mx-auto">
      <nav className="bg-[#1a2235] rounded-t-xl p-2 flex justify-between border-t border-gray-800 shadow-lg">
        <NavItem href="/" icon={<Home size={22} />} label="Ana Sayfa" isActive={pathname === "/"} />
        <NavItem
          href="/battle"
          icon={<Sword size={22} />}
          label="Savaş"
          isActive={pathname === "/battle" || pathname.startsWith("/battle/")}
        />
        <NavItem href="/quests" icon={<Scroll size={22} />} label="Görevler" isActive={pathname === "/quests"} />
        <NavItem
          href="/leaderboard"
          icon={<Trophy size={22} />}
          label="Sıralama"
          isActive={pathname === "/leaderboard"}
        />
        <NavItem href="/settings" icon={<Settings size={22} />} label="Ayarlar" isActive={pathname === "/settings"} />
      </nav>
    </div>
  )
}

function NavItem({ href, icon, label, isActive }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-2 rounded-lg ${isActive ? "bg-[#1e2738]" : ""}`}
    >
      <span className={`${isActive ? "text-amber-400" : "text-gray-400"}`}>{icon}</span>
      <span className={`text-xs mt-1 ${isActive ? "text-white" : "text-gray-400"}`}>{label}</span>
    </Link>
  )
}
