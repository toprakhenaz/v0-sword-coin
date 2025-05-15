// Confetti efektleri için yardımcı fonksiyonlar
import confetti from "canvas-confetti"

type ConfettiType = "success" | "levelUp" | "reward" | "achievement"

// Confetti efekti oluşturma fonksiyonu
export const triggerConfetti = (type: ConfettiType = "success") => {
  try {
    // Tarayıcı ortamında olduğundan emin ol
    if (typeof window !== "undefined" && typeof confetti === "function") {
      switch (type) {
        case "success":
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
          break

        case "levelUp":
          // Daha yoğun ve renkli bir efekt
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ["#FFD700", "#FFA500", "#FF4500"],
          })
          break

        case "reward":
          // Altın renkli konfeti
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#FFD700", "#FFDF00", "#F0E68C"],
          })
          break

        case "achievement":
          // Yıldız şeklinde konfeti
          const end = Date.now() + 1000
          const colors = ["#BB0000", "#ffffff"]
          ;(function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
            })

            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
            })

            if (Date.now() < end) {
              requestAnimationFrame(frame)
            }
          })()
          break
      }
    }
  } catch (error) {
    console.error("Confetti hatası:", error)
  }
}

// Özel konfeti efekti
export const customConfetti = (options: confetti.Options) => {
  try {
    if (typeof window !== "undefined" && typeof confetti === "function") {
      confetti(options)
    }
  } catch (error) {
    console.error("Özel konfeti hatası:", error)
  }
}

// Konfeti yağmuru
export const confettiRain = (duration = 3000) => {
  try {
    if (typeof window !== "undefined" && typeof confetti === "function") {
      const end = Date.now() + duration
      ;(function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }
  } catch (error) {
    console.error("Konfeti yağmuru hatası:", error)
  }
}
