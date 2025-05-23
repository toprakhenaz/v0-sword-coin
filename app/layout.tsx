import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { UserProvider } from "@/context/UserContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sword Coin",
  description: "Earn coins by tapping and upgrading your equipment",
  generator: "Next.js",
}

// Viewport'u ayrı export olarak tanımla
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className={`${inter.className} telegram-theme ios-safe-area-bottom`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}