"use client"

// This file now only contains client-side utilities for Telegram login
// The actual validation happens on the server

export function getTelegramLoginWidget(botUsername: string, redirectUrl?: string): string {
  const params = new URLSearchParams({
    bot_id: botUsername,
    origin: window.location.origin,
    return_to: redirectUrl || window.location.href,
    request_access: "write",
  })

  return `https://oauth.telegram.org/auth?${params.toString()}`
}
