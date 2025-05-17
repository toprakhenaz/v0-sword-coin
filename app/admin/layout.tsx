"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, CreditCard, Award, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Admin kimlik doğrulama kontrolü
    const checkAuth = async () => {
      try {
        // Gerçek uygulamada bir API çağrısı yapılacak
        const token = localStorage.getItem("admin_token")

        if (!token) {
          router.push("/admin/login")
          return
        }

        // Token doğrulama simülasyonu
        setTimeout(() => {
          setIsAuthenticated(true)
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121724]">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Login sayfasına yönlendirme yapıldığı için içerik göstermeye gerek yok
  }

  return (
    <div className="flex h-screen bg-[#121724]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a2235] border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-amber-400">Kılıç Yükselişi</h1>
          <p className="text-sm text-gray-400">Admin Paneli</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center p-2 rounded-lg hover:bg-[#1e2738] text-gray-300 hover:text-white"
              >
                <Shield className="w-5 h-5 mr-3" />
                <span>Genel Bakış</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center p-2 rounded-lg hover:bg-[#1e2738] text-gray-300 hover:text-white"
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Kullanıcılar</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/cards"
                className="flex items-center p-2 rounded-lg hover:bg-[#1e2738] text-gray-300 hover:text-white"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                <span>Kartlar</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/quests"
                className="flex items-center p-2 rounded-lg hover:bg-[#1e2738] text-gray-300 hover:text-white"
              >
                <Award className="w-5 h-5 mr-3" />
                <span>Görevler</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center p-2 rounded-lg hover:bg-[#1e2738] text-gray-300 hover:text-white"
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Ayarlar</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 rounded-lg hover:bg-red-900/30 text-gray-300 hover:text-red-400"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-[#1a2235] border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Paneli</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">Admin</span>
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="font-bold">A</span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
