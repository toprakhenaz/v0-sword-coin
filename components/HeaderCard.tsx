import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"

export default function HeaderCard({ coins, hourlyEarn = 0 }: { coins?: number; hourlyEarn?: number }) {
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Default to league 6 colors

  return (
    <div className="bg-[#0d1220] py-3 px-4 mb-4 flex justify-between items-center">
      <div className="flex items-center bg-gradient-to-r from-amber-700 to-amber-800 rounded-full py-1 px-3 shadow-md">
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
        <span className="text-white font-bold">{coins?.toLocaleString()}</span>
      </div>

      <div
        className="flex items-center rounded-full py-1 px-4 border-2"
        style={{
          borderColor: colors.primary,
          background: "transparent",
        }}
      >
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
        <span className="font-medium text-white">{hourlyEarn}/saat</span>
      </div>
    </div>
  )
}
