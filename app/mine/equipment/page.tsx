import CoinBalance from "@/components/coin-balance"
import { Coins } from "lucide-react"

export default function EquipmentPage() {
  return (
    <div className="pb-4">
      <CoinBalance />

      <div className="bg-[#1a2235] rounded-xl p-4 mx-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-amber-400" />
            <span className="font-bold">100,000</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">06:09:34</span>
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mx-4 mb-4">
        <div className="bg-gradient-to-br from-red-800 to-red-600 rounded-xl aspect-square flex items-center justify-center p-2">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 3L8 5V9L2 15L4 17L6 15L10 19L14 15L18 19L20 17L14 11V5L12 3H6Z"
              fill="#ef4444"
              stroke="#7f1d1d"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl aspect-square flex items-center justify-center p-2">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="bg-gray-700 rounded-xl aspect-square flex items-center justify-center">
          <span className="text-amber-400 text-5xl">?</span>
        </div>
      </div>

      <div className="flex mx-4 mb-4 space-x-2">
        <button className="bg-gray-700 rounded-full px-4 py-2 text-sm">Ekipman</button>
        <button className="bg-gray-700 rounded-full px-4 py-2 text-sm">İşçiler</button>
        <button className="bg-gray-700 rounded-full px-4 py-2 text-sm">Isekai</button>
        <button className="bg-gray-700 rounded-full px-4 py-2 text-sm">Özel</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mx-4">
        <div className="bg-[#1a2235] rounded-xl p-4">
          <div className="bg-gradient-to-br from-red-800 to-red-600 rounded-xl aspect-video flex items-center justify-center mb-2">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 3L8 5V9L2 15L4 17L6 15L10 19L14 15L18 19L20 17L14 11V5L12 3H6Z"
                fill="#ef4444"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
            </svg>
          </div>
          <h3 className="text-center font-bold mb-1">Abyssal Hammer</h3>
          <p className="text-center text-amber-400 mb-1">+300/Saat</p>
          <p className="text-center text-gray-400 mb-2">Seviye 3</p>
          <button className="w-full bg-green-600 rounded-lg py-2 flex items-center justify-center">
            <Coins className="w-5 h-5 mr-2 text-white" />
            <span className="font-bold">1400</span>
          </button>
        </div>

        <div className="bg-[#1a2235] rounded-xl p-4">
          <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl aspect-video flex items-center justify-center mb-2">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="1"
              />
            </svg>
          </div>
          <h3 className="text-center font-bold mb-1">Celestial Shield</h3>
          <p className="text-center text-amber-400 mb-1">+500/Saat</p>
          <p className="text-center text-gray-400 mb-2">Seviye 6</p>
          <button className="w-full bg-green-600 rounded-lg py-2 flex items-center justify-center">
            <Coins className="w-5 h-5 mr-2 text-white" />
            <span className="font-bold">4700</span>
          </button>
        </div>
      </div>
    </div>
  )
}
