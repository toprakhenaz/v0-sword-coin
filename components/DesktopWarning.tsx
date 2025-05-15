"use client"

import Image from "next/image"

export default function DesktopWarning() {
  return (
    <div className="desktop-warning fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
      <div className="max-w-md">
        <Image src="/sword-logo.png" alt="Sword Coin Logo" width={150} height={150} className="mx-auto mb-8" />
        <h1 className="text-3xl font-bold mb-4">Mobile Only Application</h1>
        <p className="text-xl mb-6">
          Sword Coin is designed exclusively for mobile devices. Please access this application from your smartphone or
          tablet.
        </p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">How to access:</h2>
          <ol className="text-left list-decimal pl-6 space-y-2">
            <li>Open Telegram on your mobile device</li>
            <li>Search for the Sword Coin bot (@SwordCoinBot)</li>
            <li>Start the bot and tap on the "Play" button</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
