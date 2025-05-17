import CoinBalance from "@/components/coin-balance"
import { ExternalLink, Check } from "lucide-react"

export default function EarnPage() {
  return (
    <div className="pb-4">
      <CoinBalance />

      {/* Special Offers */}
      <h2 className="text-2xl font-bold mx-4 mb-4">Özel Teklifler</h2>

      <div className="space-y-4 mx-4">
        {/* Completed Offers */}
        <div className="bg-[#1a2235] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">X'te gemz'i takip et</p>
            <p className="text-amber-400">10,000 coin</p>
          </div>
          <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-1" />
            Alındı
          </button>
        </div>

        <div className="bg-[#1a2235] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Instagram'da gemz'i takip et</p>
            <p className="text-amber-400">15,000 coin</p>
          </div>
          <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-1" />
            Alındı
          </button>
        </div>

        {/* Pending Offers */}
        <div className="bg-[#1a2235] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Discord'a katıl</p>
            <p className="text-amber-400">20,000 coin</p>
          </div>
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <ExternalLink className="w-5 h-5 mr-1" />
            Git
          </button>
        </div>

        <div className="bg-[#1a2235] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Arkadaşını davet et</p>
            <p className="text-amber-400">25,000 coin</p>
          </div>
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <ExternalLink className="w-5 h-5 mr-1" />
            Git
          </button>
        </div>

        <div className="bg-[#1a2235] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Gemz uygulamasını değerlendir</p>
            <p className="text-amber-400">30,000 coin</p>
          </div>
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <ExternalLink className="w-5 h-5 mr-1" />
            Git
          </button>
        </div>
      </div>

      {/* Daily Missions */}
      <h2 className="text-2xl font-bold mx-4 mt-8 mb-4">Günlük Görevler</h2>

      <div className="mx-4 bg-[#1a2235] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Günlük giriş yap</p>
              <p className="text-amber-400">5,000 coin</p>
            </div>
          </div>
          <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-1" />
            Tamamlandı
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">30 dakika aktif kal</p>
              <div className="flex items-center">
                <p className="text-amber-400 mr-2">10,000 coin</p>
                <div className="bg-gray-700 w-24 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "60%" }}></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">18/30 dk</span>
              </div>
            </div>
          </div>
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <ExternalLink className="w-5 h-5 mr-1" />
            Git
          </button>
        </div>
      </div>
    </div>
  )
}
