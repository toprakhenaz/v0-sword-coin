import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { UserProvider } from "./context/UserContext"
import DeviceDetectionProvider from "@/providers/DeviceDetectionProvider"
import SupabaseProvider from "@/providers/SupabaseProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sword Coin",
  description: "Earn crypto by playing games",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/GeistVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeistMonoVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <SupabaseProvider>
          <UserProvider>
            <DeviceDetectionProvider>{children}</DeviceDetectionProvider>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
