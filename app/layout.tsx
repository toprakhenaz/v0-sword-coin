import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/providers/SupabaseProvider"
import { Toaster } from "react-hot-toast"
import Script from "next/script"
import { UserProvider } from "@/providers/UserProvider"
import { DeviceDetectionProvider } from "@/providers/DeviceDetectionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sword Coin",
  description: "Earn coins, upgrade your swords, and compete with friends!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <Script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white overflow-x-hidden`}>
        <SupabaseProvider>
          <UserProvider>
            <DeviceDetectionProvider>
              {children}
              <Toaster position="top-center" />
            </DeviceDetectionProvider>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
