"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple check to see if we're in a browser environment
    if (typeof window !== "undefined") {
      setIsLoading(false)
    }
  }, [])

  const handleLoginWithTelegram = () => {
    // For demonstration, we'll use a mock login
    // In production, this would integrate with Telegram's auth
    localStorage.setItem(
      "demo_user",
      JSON.stringify({
        id: "12345",
        username: "demo_user",
        first_name: "Demo",
        coins: 1000,
        energy: 100,
        max_energy: 100,
        league: 1,
      }),
    )

    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sword Coin</h1>
          <p className="text-gray-400">Login to start earning coins!</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

        <div className="space-y-4">
          <button
            onClick={handleLoginWithTelegram}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
            </svg>
            Login with Telegram
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>This app works best inside Telegram.</p>
            <p>Open in Telegram for the full experience!</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
