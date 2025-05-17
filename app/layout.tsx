import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"
import TelegramInit from "@/components/telegram-init"

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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TelegramInit>
            <div className="w-full max-w-md mx-auto min-h-screen h-full flex flex-col relative overflow-hidden">
              <main className="flex-1 overflow-auto pt-safe-top pb-20 px-safe-left pr-safe-right">{children}</main>
              <Navigation />
            </div>
          </TelegramInit>
        </ThemeProvider>
      </body>
    </html>
  )
}
