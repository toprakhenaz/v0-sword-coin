"use client"

import { useState, useEffect } from "react"
import { Users, CreditCard, Award, DollarSign, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCards: 0,
    totalQuests: 0,
    totalCoins: 0,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Gerçek uygulamada bir API çağrısı yapılacak
    // Burada demo veriler kullanıyoruz
    const fetchStats = async () => {
      try {
        // API çağrısı simülasyonu
        setTimeout(() => {
          setStats({
            totalUsers: 1245,
            activeUsers: 876,
            totalCards: 32,
            totalQuests: 48,
            totalCoins: 15000000,
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("İstatistik yükleme hatası:", error)
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Toplam Kullanıcılar */}
        <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-300">Toplam Kullanıcılar</h3>
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</span>
            <span className="ml-2 text-sm text-green-400">+12% ↑</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Aktif: {stats.activeUsers.toLocaleString()}</p>
        </div>

        {/* Toplam Kartlar */}
        <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-300">Toplam Kartlar</h3>
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{stats.totalCards.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Aktif: {Math.floor(stats.totalCards * 0.8)}</p>
        </div>

        {/* Toplam Görevler */}
        <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-300">Toplam Görevler</h3>
            <div className="p-2 bg-amber-900/30 rounded-lg">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{stats.totalQuests.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Aktif: {Math.floor(stats.totalQuests * 0.75)}</p>
        </div>

        {/* Toplam Altın */}
        <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-300">Toplam Altın</h3>
            <div className="p-2 bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{stats.totalCoins.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Günlük: {Math.floor(stats.totalCoins / 30).toLocaleString()}</p>
        </div>
      </div>

      {/* Aktivite Grafiği */}
      <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-300">Kullanıcı Aktivitesi</h3>
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-sm text-blue-400">Son 7 gün</span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between">
          {/* Basit bir grafik simülasyonu */}
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, index) => {
            const height = Math.floor(Math.random() * 60) + 20
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md mx-1"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-400 mt-2">{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Son Etkinlikler */}
      <div className="bg-[#1a2235] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Son Etkinlikler</h3>

        <div className="space-y-4">
          {[
            { action: "Yeni kullanıcı kaydoldu", user: "KılıçUstası", time: "5 dakika önce" },
            { action: "Yeni kart eklendi", user: "Admin", time: "1 saat önce" },
            { action: "Görev tamamlandı", user: "EjderhaKatili", time: "3 saat önce" },
            { action: "Silah yükseltildi", user: "AltınAvcısı", time: "5 saat önce" },
            { action: "Sistem güncellemesi yapıldı", user: "Admin", time: "1 gün önce" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#1e2738] rounded-lg">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-400">Kullanıcı: {activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
