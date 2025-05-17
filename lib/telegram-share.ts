/**
 * Telegram'da paylaşım yapmak için yardımcı fonksiyonlar
 */

// Telegram'da mesaj paylaşma
export function shareToTelegram(text: string, url?: string) {
  if (typeof window === "undefined") return false

  let shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url || window.location.href)}`

  if (text) {
    shareUrl += `&text=${encodeURIComponent(text)}`
  }

  // Telegram Web App API varsa, openTelegramLink kullan
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.openTelegramLink(shareUrl)
    return true
  }

  // Yoksa normal pencere aç
  window.open(shareUrl, "_blank")
  return true
}

// Arkadaşını davet et fonksiyonu
export function inviteFriend(referralCode: string, botUsername: string) {
  if (typeof window === "undefined") return false

  const message = `Sword Coin'de bana katıl ve tap-to-earn ile coin kazan! Referans kodum: ${referralCode}`
  const url = `https://t.me/${botUsername}?start=${referralCode}`

  return shareToTelegram(message, url)
}

// Başarı paylaşma
export function shareAchievement(achievement: string, score: number) {
  if (typeof window === "undefined") return false

  const message = `Sword Coin'de yeni bir başarı kazandım: ${achievement} - Skor: ${score.toLocaleString()}! Sen de katıl ve coin kazanmaya başla!`

  return shareToTelegram(message)
}
