// HTML5 Audio fallback system for reliable cross-platform audio playback
const audioPool: { [key: string]: HTMLAudioElement[] } = {}
const POOL_SIZE = 3
let isInitialized = false

// Audio system status
const audioStatus = {
  initialized: false,
  totalChords: 0,
  shouldUseFallback: false,
  hasAudioContext: false,
}

export async function initializeHTML5Audio(): Promise<boolean> {
  try {
    // Detect iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    audioStatus.shouldUseFallback = isIOS || isSafari
    audioStatus.hasAudioContext = "AudioContext" in window || "webkitAudioContext" in window

    // Test HTML5 Audio support
    const testAudio = new Audio()
    const canPlay = testAudio.canPlayType("audio/wav")

    if (canPlay === "" || canPlay === "no") {
      throw new Error("HTML5 Audio not supported")
    }

    audioStatus.initialized = true
    isInitialized = true
    console.log("✅ HTML5 Audio initialized successfully")
    return true
  } catch (error) {
    console.error("❌ HTML5 Audio initialization failed:", error)
    return false
  }
}

export async function playChordHTML5(chordName: string): Promise<boolean> {
  if (!isInitialized) {
    await initializeHTML5Audio()
  }

  try {
    // Create audio pool if it doesn't exist
    if (!audioPool[chordName]) {
      await createAudioPool(chordName)
    }

    // Find an available audio element
    const availableAudio = audioPool[chordName]?.find((audio) => audio.paused || audio.ended || audio.currentTime === 0)

    if (availableAudio) {
      availableAudio.currentTime = 0

      // iOS requires user interaction - try to play immediately
      const playPromise = availableAudio.play()
      if (playPromise) {
        await playPromise
      }
      return true
    }

    // If no available audio, create a new one
    const newAudio = await createChordAudio(chordName)
    if (newAudio) {
      const playPromise = newAudio.play()
      if (playPromise) {
        await playPromise
      }
      return true
    }

    return false
  } catch (error) {
    console.error("HTML5 Audio playback failed:", error)

    // Try alternative approach for iOS
    if (audioStatus.shouldUseFallback) {
      return await playChordIOS(chordName)
    }

    return false
  }
}

async function playChordIOS(chordName: string): Promise<boolean> {
  try {
    // Create a simple audio element with immediate playback for iOS
    const audio = new Audio()
    audio.volume = 0.7
    audio.crossOrigin = "anonymous"

    // Generate simple tone for iOS
    const audioData = generateSimpleChordTone(chordName)
    audio.src = audioData

    // iOS-specific: Load and play immediately
    audio.load()
    const playPromise = audio.play()

    if (playPromise) {
      await playPromise
      console.log("✅ iOS audio playback successful")
      return true
    }

    return false
  } catch (error) {
    console.error("iOS audio playback failed:", error)
    return false
  }
}

async function createAudioPool(chordName: string): Promise<void> {
  audioPool[chordName] = []

  for (let i = 0; i < POOL_SIZE; i++) {
    const audio = await createChordAudio(chordName)
    if (audio) {
      audioPool[chordName].push(audio)
    }
  }

  audioStatus.totalChords = Object.keys(audioPool).length
}

async function createChordAudio(chordName: string): Promise<HTMLAudioElement | null> {
  try {
    const audio = new Audio()
    audio.preload = "auto"
    audio.volume = 0.7
    audio.crossOrigin = "anonymous"

    // Generate audio data for the chord
    const audioData = generateSimpleChordTone(chordName)
    audio.src = audioData

    return audio
  } catch (error) {
    console.error("Failed to create chord audio:", error)
    return null
  }
}

function generateSimpleChordTone(chordName: string): string {
  // Generate a simple sine wave for the chord root note
  const frequency = getChordRootFrequency(chordName)
  const sampleRate = 44100
  const duration = 1.5
  const samples = Math.floor(sampleRate * duration)

  // Create audio buffer
  const buffer = new ArrayBuffer(samples * 2)
  const view = new DataView(buffer)

  for (let i = 0; i < samples; i++) {
    // Generate sine wave with envelope
    const t = i / sampleRate
    const envelope = Math.exp(-t * 2) // Exponential decay

    // Add some harmonics for richer sound
    let sample = Math.sin(2 * Math.PI * frequency * t) * 0.4 // Root
    sample += Math.sin(2 * Math.PI * frequency * 1.25 * t) * 0.2 // Third
    sample += Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.15 // Fifth

    sample *= envelope

    // Convert to 16-bit PCM
    const pcm = Math.max(-32768, Math.min(32767, sample * 32767))
    view.setInt16(i * 2, pcm, true)
  }

  // Create WAV file
  const wavBuffer = createSimpleWAV(buffer, sampleRate)
  const blob = new Blob([wavBuffer], { type: "audio/wav" })
  return URL.createObjectURL(blob)
}

function createSimpleWAV(audioBuffer: ArrayBuffer, sampleRate: number): ArrayBuffer {
  const length = audioBuffer.byteLength
  const buffer = new ArrayBuffer(44 + length)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + length, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, length, true)

  // Copy audio data
  const audioView = new Uint8Array(audioBuffer)
  const wavView = new Uint8Array(buffer, 44)
  wavView.set(audioView)

  return buffer
}

function getChordRootFrequency(chordName: string): number {
  const rootFrequencies: { [key: string]: number } = {
    C: 261.63,
    "C#": 277.18,
    Db: 277.18,
    D: 293.66,
    "D#": 311.13,
    Eb: 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    Gb: 369.99,
    G: 392.0,
    "G#": 415.3,
    Ab: 415.3,
    A: 440.0,
    "A#": 466.16,
    Bb: 466.16,
    B: 493.88,
  }

  // Extract root note from chord name
  const root =
    chordName.charAt(0).toUpperCase() +
    (chordName.charAt(1) === "#" || chordName.charAt(1) === "b" ? chordName.charAt(1) : "")
  return rootFrequencies[root] || rootFrequencies["C"]
}

export async function preloadHTML5Chords(chords: string[]): Promise<void> {
  console.log("🎵 Preloading HTML5 chords:", chords)

  for (const chord of chords) {
    try {
      await createAudioPool(chord)
    } catch (error) {
      console.warn(`Failed to preload chord ${chord}:`, error)
    }
  }

  console.log("✅ HTML5 chords preloaded")
}

export async function preloadChord(chordName: string): Promise<void> {
  if (!audioPool[chordName]) {
    await createAudioPool(chordName)
  }
}

export function getHTML5AudioStatus() {
  return {
    ...audioStatus,
    totalChords: Object.keys(audioPool).length,
  }
}

// Initialize on module load for iOS compatibility
if (typeof window !== "undefined") {
  // Auto-initialize on first user interaction
  const initOnInteraction = () => {
    initializeHTML5Audio()
    document.removeEventListener("touchstart", initOnInteraction)
    document.removeEventListener("click", initOnInteraction)
  }

  document.addEventListener("touchstart", initOnInteraction, { once: true })
  document.addEventListener("click", initOnInteraction, { once: true })
}
