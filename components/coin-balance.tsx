import { Coins, Clock } from "lucide-react"

export default function CoinBalance({ coins = 23951, hourlyRate = 11600 }) {
  return (
    <div className="bg-gradient-to-r from-[#1a2235] to-[#1e2738] rounded-xl p-4 mx-4 my-4 flex justify-between items-center shadow-lg border border-gray-800/50">
      <div className="flex items-center">
        <div className="relative">
          <Coins className="w-6 h-6 text-amber-400 absolute -top-1 -left-1 animate-pulse" />
          <Coins className="w-6 h-6 text-amber-400" />
        </div>
        <span className="text-2xl font-bold ml-2 text-amber-400">{coins.toLocaleString()}</span>
      </div>
      <div className="flex items-center bg-[#1e2738]/70 px-3 py-1 rounded-full">
        <Clock className="w-4 h-4 mr-1 text-amber-400" />
        <span className="font-bold text-amber-400">{hourlyRate.toLocaleString()}/h</span>
      </div>
    </div>
  )
}
