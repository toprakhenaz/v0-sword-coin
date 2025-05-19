"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TelegramLogin from "@/components/TelegramLogin"
import { useUser } from "@/context/UserContext"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, setDefaultUser } = useUser()
  const [isCreatingDefaultUser, setIsCreatingDefaultUser] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  const handleContinueAsGuest = async () => {
    try {
      setIsCreatingDefaultUser(true)
      setErrorMessage(null)

      // Create a random username for the guest user
      const guestUsername = `guest_${Math.floor(Math.random() * 10000)}`

      // Create a new default user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            username: guestUsername,
            coins: 1000,
            league: 1,
            hourly_earn: 10,
            earn_per_tap: 1,
            energy: 100,
            max_energy: 100,
            last_energy_regen: new Date().toISOString(),
            last_hourly_collect: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating default user:", createError)
        setErrorMessage("Failed to create guest account. Please try again.")
        setIsCreatingDefaultUser(false)
        return
      }

      // Create initial boosts for the user
      await supabase.from("user_boosts").insert([
        {
          user_id: newUser.id,
          multi_touch_level: 1,
          energy_limit_level: 1,
          charge_speed_level: 1,
          daily_rockets: 3,
          max_daily_rockets: 3,
          energy_full_used: false,
        },
      ])

      // Set the default user in context
      setDefaultUser(newUser)

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error creating default user:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsCreatingDefaultUser(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sword Coin</h1>
          <p className="text-gray-400">Giriş yaparak oyuna başlayın</p>
        </div>

        <div className="flex justify-center">
          <Image
            src="/wooden-fantasy-sword.png"
            alt="Sword Coin Logo"
            width={150}
            height={150}
            className="animate-pulse"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Oyun Özellikleri</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Tıklayarak coin kazanın</li>
              <li>Ekipmanlarınızı yükseltin</li>
              <li>Liglerde yükselin</li>
              <li>Arkadaşlarınızla rekabet edin</li>
            </ul>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-full">
              <TelegramLogin
                botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "innoSwordCoinBot"}
                buttonSize="large"
                cornerRadius={8}
                className="flex justify-center"
              />
            </div>

            <div className="flex items-center w-full">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span className="px-4 text-gray-500 text-sm">veya</span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            <button
              onClick={handleContinueAsGuest}
              disabled={isCreatingDefaultUser}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
            >
              {isCreatingDefaultUser ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <FontAwesomeIcon icon={icons.userGroup} className="mr-2" />
              )}
              Misafir Olarak Devam Et
            </button>
          </div>

          {errorMessage && <div className="text-red-400 text-sm text-center">{errorMessage}</div>}

          <p className="text-xs text-center text-gray-400">
            Giriş yaparak kullanım koşullarını ve gizlilik politikasını kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
