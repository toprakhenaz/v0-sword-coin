// Sound effects for the game

let audioContext: AudioContext | null = null

// Initialize audio context on user interaction
export function initAudio() {
  if (audioContext === null) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
}

// Play tap sound
export function playTapSound() {
  if (!audioContext) {
    initAudio()
  }

  if (audioContext) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.value = 600
    gainNode.gain.value = 0.1

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
    oscillator.stop(audioContext.currentTime + 0.2)
  }
}

// Play level up sound
export function playLevelUpSound() {
  if (!audioContext) {
    initAudio()
  }

  if (audioContext) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.value = 300
    gainNode.gain.value = 0.1

    oscillator.start()
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
    oscillator.stop(audioContext.currentTime + 0.3)
  }
}
