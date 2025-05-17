// Telegram Web App API entegrasyonu
// https://core.telegram.org/bots/webapps

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        initData: string
        initDataUnsafe: {
          query_id?: string
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
          auth_date: number
          hash: string
        }
        showAlert: (message: string) => void
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive: boolean) => void
          hideProgress: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          setText: (text: string) => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }
        BackButton: {
          isVisible: boolean
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
          notificationOccurred: (type: "error" | "success" | "warning") => void
          selectionChanged: () => void
        }
        onEvent: (eventType: string, eventHandler: () => void) => void
        offEvent: (eventType: string, eventHandler: () => void) => void
        sendData: (data: string) => void
        openLink: (url: string) => void
        openTelegramLink: (url: string) => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
      }
    }
  }
}

// Telegram Web App API'sini başlat
export function initTelegramWebApp() {
  if (typeof window !== "undefined" && window.Telegram) {
    // Telegram Web App'e hazır olduğumuzu bildir
    window.Telegram.WebApp.ready()

    // Tam ekran modunu etkinleştir
    window.Telegram.WebApp.expand()

    // Arka plan rengini ayarla
    window.Telegram.WebApp.setBackgroundColor("#121724")

    // Haptic feedback için yardımcı fonksiyon
    return {
      getUserInfo: () => window.Telegram.WebApp.initDataUnsafe.user,
      vibrate: (style: "light" | "medium" | "heavy" = "medium") => {
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
        } else if (navigator.vibrate) {
          // Fallback olarak Web Vibration API kullan
          switch (style) {
            case "light":
              navigator.vibrate(10)
              break
            case "medium":
              navigator.vibrate(20)
              break
            case "heavy":
              navigator.vibrate([30, 20, 30])
              break
            case "rigid":
              navigator.vibrate([10, 10, 10])
              break
            case "soft":
              navigator.vibrate(5)
              break
          }
        }
      },
      showNotification: (type: "error" | "success" | "warning", message?: string) => {
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(type)
        }
        if (message) {
          window.Telegram.WebApp.showAlert(message)
        }
      },
      showMainButton: (text: string, callback: () => void) => {
        const mainButton = window.Telegram.WebApp.MainButton
        mainButton.setText(text)
        mainButton.onClick(callback)
        mainButton.show()
      },
      hideMainButton: () => {
        window.Telegram.WebApp.MainButton.hide()
      },
    }
  }

  // Telegram Web App API mevcut değilse boş fonksiyonlar döndür
  return {
    getUserInfo: () => null,
    vibrate: () => {},
    showNotification: () => {},
    showMainButton: () => {},
    hideMainButton: () => {},
  }
}

// Telegram kullanıcı bilgilerini doğrula
export async function verifyTelegramUser(initData: string) {
  try {
    const response = await fetch("/api/verify-telegram-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ initData }),
    })

    if (!response.ok) {
      throw new Error("Telegram kullanıcı doğrulaması başarısız oldu")
    }

    return await response.json()
  } catch (error) {
    console.error("Telegram kullanıcı doğrulama hatası:", error)
    return null
  }
}
