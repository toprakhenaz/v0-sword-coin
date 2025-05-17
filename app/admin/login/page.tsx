"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Gerçek uygulamada bir API çağrısı yapılacak
      // Burada basit bir simülasyon yapıyoruz

      // Demo için basit bir kontrol
      if (username === "admin" && password === "admin123") {
        // Başarılı giriş simülasyonu
        localStorage.setItem("admin_token", "demo_token_123")

        setTimeout(() => {
          setIsLoading(false)
          router.push("/admin")
        }, 1000)
      } else {
        throw new Error("Geçersiz kullanıcı adı veya şifre")
      }
    } catch (error) {
      setIsLoading(false)
      setError(error instanceof Error ? error.message : "Giriş başarısız")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121724]">
      <div className="bg-[#1a2235] p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-amber-400">Kılıç Yükselişi</h1>
          <p className="text-gray-400">Admin Paneli Girişi</p>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1e2738] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-3 px-4 rounded-lg hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Giriş Yapılıyor...
              </span>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo giriş: admin / admin123</p>
        </div>
      </div>
    </div>
  )
}
