import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sword Coin",
  description: "Tap-to-Earn Telegram Mini App",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${poppins.className} bg-[#121724] text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
