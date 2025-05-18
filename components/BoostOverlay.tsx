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
    <div className="fixed inset-0 bg-black/90 z-50 text-white flex flex-col backdrop-blur-md">
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          background: `linear-gradient(to right, ${colors.primary}20, ${colors.secondary}20)`,
          borderBottom: `1px solid ${colors.secondary}40`,
          boxShadow: `0 2px 10px ${colors.glow}30`,
        }}
      >
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-gray-800/50"
        >
          <FontAwesomeIcon icon={icons.chevronLeft} className="mr-2" />
          Back
        </button>
        <div className="flex items-center bg-gray-800/70 px-4 py-2 rounded-full backdrop-blur-sm">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-xl" />
          <span className="text-2xl font-bold">{coins.toLocaleString()}</span>
        </div>
        <button className="text-gray-400 hover:text-white px-3 py-2 rounded-full hover:bg-gray-800/50">
          <FontAwesomeIcon icon={icons.infoCircle} />
        </button>
      </div>

      <div className="p-6 flex-grow overflow-auto">
        <h1 className="text-2xl font-bold text-center mb-6 relative inline-block w-full" style={{ color: colors.text }}>
          <span
            className="absolute left-0 right-0 h-1 bottom-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          ></span>
          Free Daily Boosts
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className="rounded-xl p-4 flex items-center relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.3))`,
              border: `1px solid rgba(239, 68, 68, 0.4)`,
              boxShadow: `0 4px 12px rgba(239, 68, 68, 0.2)`,
            }}
          >
            {/* Animated background elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at 30% 70%, rgba(255, 0, 0, 0.8), transparent 50%),
                            radial-gradient(circle at 70% 30%, rgba(255, 100, 0, 0.7), transparent 50%)`,
              }}
            ></div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4 shadow-xl z-10">
              <FontAwesomeIcon
                icon={icons.rocket}
                className="text-3xl text-white animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div className="z-10">
              <h3 className="text-xl font-bold text-yellow-500">Rocket Boost</h3>
              <p className="text-lg flex items-center">
                <span className="text-white font-bold">{dailyRockets}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-300">{maxDailyRockets}</span>
                <span className="text-gray-400 text-sm ml-2">remaining today</span>
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(34, 197, 94, 0.3))`,
              border: `1px solid rgba(34, 197, 94, 0.4)`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.2)`,
            }}
          >
            {/* Animated background elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at 30% 70%, rgba(0, 255, 0, 0.8), transparent 50%),
                            radial-gradient(circle at 70% 30%, rgba(0, 200, 100, 0.7), transparent 50%)`,
              }}
            ></div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mr-4 shadow-xl z-10">
              <FontAwesomeIcon
                icon={icons.batteryFull}
                className="text-3xl text-white animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div className="z-10">
              <h3 className="text-xl font-bold text-green-500">Full Energy</h3>
              <p className="text-lg">
                <span className={`font-bold ${energyFull ? "text-red-400" : "text-green-400"}`}>
                  {energyFull ? "Used today" : "Available"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 relative inline-block w-full" style={{ color: colors.text }}>
          <span
            className="absolute left-0 right-0 h-1 bottom-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          ></span>
          Permanent Upgrades
        </h1>

        <div className="space-y-4">
          <div
            className="rounded-xl p-4 relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(250, 204, 21, 0.3))`,
              border: `1px solid rgba(250, 204, 21, 0.4)`,
              boxShadow: `0 4px 12px rgba(250, 204, 21, 0.2)`,
            }}
          >
            {/* Animated background elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.7), transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(255, 165, 0, 0.6), transparent 50%)`,
              }}
            ></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center mr-4 shadow-xl">
                  <FontAwesomeIcon icon={icons.handPointer} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-500">Multi-Touch</h3>
                  <div className="flex items-center text-sm">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span className="text-white">{boosts.multiTouch.cost.toLocaleString()}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-300">Level {boosts.multiTouch.level}</span>
                    <span className="ml-2 text-green-400 text-xs">+{boosts.multiTouch.level * 2} coins/tap</span>
                  </div>
                </div>
              </div>
              <button
                className="text-white w-12 h-12 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}80)`,
                  border: `1px solid ${colors.secondary}80`,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                onClick={() => onBoostUpgrade("multiTouch")}
              >
                <FontAwesomeIcon icon={icons.plus} size="lg" />
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-4 relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(34, 197, 94, 0.3))`,
              border: `1px solid rgba(34, 197, 94, 0.4)`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.2)`,
            }}
          >
            {/* Animated background elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at 20% 50%, rgba(0, 200, 0, 0.7), transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(0, 150, 100, 0.6), transparent 50%)`,
              }}
            ></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mr-4 shadow-xl">
                  <FontAwesomeIcon icon={icons.batteryFull} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-500">Energy Limit</h3>
                  <div className="flex items-center text-sm">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span className="text-white">{boosts.energyLimit.cost.toLocaleString()}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-300">Level {boosts.energyLimit.level}</span>
                    <span className="ml-2 text-green-400 text-xs">
                      +{(boosts.energyLimit.level - 1) * 500} max energy
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="text-white w-12 h-12 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}80)`,
                  border: `1px solid ${colors.secondary}80`,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                onClick={() => onBoostUpgrade("energyLimit")}
              >
                <FontAwesomeIcon icon={icons.plus} size="lg" />
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-4 relative overflow-hidden transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.3))`,
              border: `1px solid rgba(59, 130, 246, 0.4)`,
              boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2)`,
            }}
          >
            {/* Animated background elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at 20% 50%, rgba(0, 100, 255, 0.7), transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(100, 0, 255, 0.6), transparent 50%)`,
              }}
            ></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 shadow-xl">
                  <FontAwesomeIcon icon={icons.bolt} className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400">Charge Speed</h3>
                  <div className="flex items-center text-sm">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
                    <span className="text-white">{boosts.chargeSpeed.cost.toLocaleString()}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-gray-300">Level {boosts.chargeSpeed.level}</span>
                    <span className="ml-2 text-blue-400 text-xs">+{boosts.chargeSpeed.level * 20}% recharge rate</span>
                  </div>
                </div>
              </div>
              <button
                className="text-white w-12 h-12 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}80)`,
                  border: `1px solid ${colors.secondary}80`,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                onClick={() => onBoostUpgrade("chargeSpeed")}
              >
                <FontAwesomeIcon icon={icons.plus} size="lg" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className={`py-4 px-4 rounded-xl font-bold text-white text-center transition-all duration-300 flex items-center justify-center shadow-xl ${
              dailyRockets <= 0 ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            }`}
            style={{
              background: `linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(239, 68, 68, 0.9))`,
              boxShadow: `0 4px 12px rgba(239, 68, 68, 0.3)`,
              border: `1px solid rgba(239, 68, 68, 0.6)`,
            }}
            onClick={onUseRocket}
            disabled={dailyRockets <= 0}
          >
            <div className="mr-2 w-10 h-10 rounded-full bg-red-800/50 flex items-center justify-center">
              <FontAwesomeIcon icon={icons.rocket} className="text-xl text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg">Use Rocket</div>
              <div className="text-xs text-red-200">+500 energy instantly</div>
            </div>
          </button>

          <button
            className={`py-4 px-4 rounded-xl font-bold text-white text-center transition-all duration-300 flex items-center justify-center shadow-xl ${
              energyFull ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            }`}
            style={{
              background: `linear-gradient(135deg, rgba(22, 163, 74, 0.8), rgba(34, 197, 94, 0.9))`,
              boxShadow: `0 4px 12px rgba(34, 197, 94, 0.3)`,
              border: `1px solid rgba(34, 197, 94, 0.6)`,
            }}
            onClick={onUseFullEnergy}
            disabled={energyFull}
          >
            <div className="mr-2 w-10 h-10 rounded-full bg-green-800/50 flex items-center justify-center">
              <FontAwesomeIcon icon={icons.batteryFull} className="text-xl text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg">Full Energy</div>
              <div className="text-xs text-green-200">Refill to maximum</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
