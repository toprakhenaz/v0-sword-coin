import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Script from "next/script"
import { UserProvider } from "@/app/context/UserContext"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Hamster Combat",
  description: "Tap-to-earn Hamster Combat game",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-900" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px" }}>
        <UserProvider>{children}</UserProvider>
        <Toaster />
      </body>
    </html>
  )
}
