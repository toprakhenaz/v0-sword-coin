// Ses efektleri için yardımcı fonksiyonlar
type SoundType = "tap" | "levelUp" | "upgrade" | "boost" | "error"

const soundFiles: Record<SoundType, string> = {
  tap: "/sounds/tap.mp3",
  levelUp: "/sounds/level-up.mp3",
  upgrade: "/sounds/upgrade.mp3",
  boost: "/sounds/boost.mp3",
  error: "/sounds/error.mp3",
}

// Ses çalma fonksiyonu
export const playSound = (type: SoundType) => {
  try {
    // Tarayıcı ortamında olduğundan emin ol
    if (typeof window !== "undefined") {
      const audio = new Audio(soundFiles[type])
      audio.volume = 0.5 // Ses seviyesini ayarla
      audio.play().catch((error) => {
        // Bazı tarayıcılar kullanıcı etkileşimi olmadan ses çalmaya izin vermez
        console.log("Ses çalma hatası:", error)
      })
    }
  } catch (error) {
    console.error("Ses çalma hatası:", error)
  }
}

// Eksik olan dışa aktarımlar
export const playTapSound = () => playSound("tap")
export const playLevelUpSound = () => playSound("levelUp")
export const playUpgradeSound = () => playSound("upgrade")
export const playBoostSound = () => playSound("boost")
export const playErrorSound = () => playSound("error")

// Ses efektlerini devre dışı bırakma/etkinleştirme
let soundEnabled = true

export const toggleSound = () => {
  soundEnabled = !soundEnabled
  return soundEnabled
}

export const isSoundEnabled = () => soundEnabled
