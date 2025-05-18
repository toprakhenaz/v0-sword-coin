"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"

interface BoostOverlayProps {
  onClose: () => void
  coins: number
  dailyRockets: number
  maxDailyRockets: number
  energyFull: boolean
  boosts: {
    multiTouch: { level: number; cost: number }
    energyLimit: { level: number; cost: number }
    chargeSpeed: { level: number; cost: number }
  }
  onBoostUpgrade: (boostType: string) => void
  onUseRocket: () => void
  onUseFullEnergy: () => void
}

export default function BoostOverlay({
  onClose,
  coins,
  dailyRockets,
  maxDailyRockets,
  energyFull,
  boosts,
  onBoostUpgrade,
  onUseRocket,
  onUseFullEnergy,
}: BoostOverlayProps) {
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the boost overlay

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 text-white flex flex-col backdrop-blur-sm">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-800"
        style={{
          background: `linear-gradient(to right, ${colors.primary}20, ${colors.secondary}20)`,
          borderBottom: `1px solid ${colors.secondary}40`,
        }}
      >
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={icons.chevronLeft} className="mr-2" />
          Back
        </button>
        <div className="flex items-center">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-xl" />
          <span className="text-2xl font-bold">{coins.toLocaleString()}</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={icons.infoCircle} />
        </button>
      </div>

      <div className="p-6 flex-grow overflow-auto">
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: colors.text }}>
          Ücretsiz Günlük Güçlendirmeler
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className="rounded-xl p-4 flex items-center"
            style={{
              background: `linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.3))`,
              border: `1px solid rgba(239, 68, 68, 0.4)`,
              boxShadow: `0 4px 12px rgba(239, 68, 68, 0.2)`,
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={icons.rocket} className="text-3xl text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-500">Roket</h3>
              <p className="text-lg">
                {dailyRockets}/{maxDailyRockets}
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center"
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(34, 197, 94, 0.3))`,
              border: `1px solid rgba(34, 197, 94, 0.4)`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.2)`,
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={icons.batteryFull} className="text-3xl text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-500">Tam Enerji</h3>
              <p className="text-lg">{energyFull ? "kullanıldı" : "mevcut"}</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: colors.text }}>
          Güçlendiriciler
        </h1>

        <div className="space-y-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(250, 204, 21, 0.3))`,
              border: `1px solid rgba(250, 204, 21, 0.4)`,
              boxShadow: `0 4px 12px rgba(250, 204, 21, 0.2)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={icons.handPointer} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-500">Çoklu Dokunma</h3>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span>{boosts.multiTouch.cost.toLocaleString()} • </span>
                    <span className="ml-1 text-gray-400">seviye {boosts.multiTouch.level}</span>
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `1px solid ${colors.secondary}40`,
                }}
                onClick={() => onBoostUpgrade("multiTouch")}
              >
                <FontAwesomeIcon icon={icons.chevronRight} size="lg" />
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(34, 197, 94, 0.3))`,
              border: `1px solid rgba(34, 197, 94, 0.4)`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.2)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={icons.batteryFull} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-500">Enerji Limiti</h3>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span>{boosts.energyLimit.cost.toLocaleString()} • </span>
                    <span className="ml-1 text-gray-400">seviye {boosts.energyLimit.level}</span>
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `1px solid ${colors.secondary}40`,
                }}
                onClick={() => onBoostUpgrade("energyLimit")}
              >
                <FontAwesomeIcon icon={icons.chevronRight} size="lg" />
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: `linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.3))`,
              border: `1px solid rgba(59, 130, 246, 0.4)`,
              boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <FontAwesomeIcon icon={icons.bolt} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400">Şarj Hızı</h3>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span>{boosts.chargeSpeed.cost.toLocaleString()} • </span>
                    <span className="ml-1 text-gray-400">seviye {boosts.chargeSpeed.level}</span>
                  </div>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `1px solid ${colors.secondary}40`,
                }}
                onClick={() => onBoostUpgrade("chargeSpeed")}
              >
                <FontAwesomeIcon icon={icons.chevronRight} size="lg" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className="py-3 px-4 rounded-xl font-medium text-white text-center transition-all duration-300 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(239, 68, 68, 0.9))`,
              boxShadow: `0 4px 12px rgba(239, 68, 68, 0.3)`,
              border: `1px solid rgba(239, 68, 68, 0.6)`,
            }}
            onClick={onUseRocket}
            disabled={dailyRockets <= 0}
          >
            <FontAwesomeIcon icon={icons.rocket} className="mr-2 text-xl" />
            Use Rocket
          </button>

          <button
            className="py-3 px-4 rounded-xl font-medium text-white text-center transition-all duration-300 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.8), rgba(34, 197, 94, 0.9))`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.3)`,
              border: `1px solid rgba(34, 197, 94, 0.6)`,
            }}
            onClick={onUseFullEnergy}
            disabled={energyFull}
          >
            <FontAwesomeIcon icon={icons.batteryFull} className="mr-2 text-xl" />
            Full Energy
          </button>
        </div>
      </div>
    </div>
  )
}
