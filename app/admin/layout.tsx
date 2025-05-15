import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { Toaster } from "react-hot-toast"
import AdminSidebar from "@/components/Admin/AdminSidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sword Coin Admin",
  description: "Admin panel for Sword Coin",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <SupabaseProvider>
          <div className="flex h-screen">
            <AdminSidebar />
            <div className="flex-1 overflow-auto p-8">
              {children}
              <Toaster position="top-right" />
            </div>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}
