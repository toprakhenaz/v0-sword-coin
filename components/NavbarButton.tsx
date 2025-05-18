import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

function NavbarButton({
  href,
  icon,
  label,
  active,
}: { href: string; icon: IconDefinition; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div
        className={`bottom-nav-button w-20 h-16 rounded-xl flex flex-col items-center justify-center 
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

export default NavbarButton
