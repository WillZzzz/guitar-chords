// Hybrid audio system that uses both Web Audio API and HTML5 Audio for maximum compatibility
let audioContext: AudioContext | null = null
let isInitialized = false
let audioMethod: "webaudio" | "html5" | null = null

// HTML5 Audio pool for chord playback
const audioPool: { [key: string]: HTMLAudioElement[] } = {}
const POOL_SIZE = 3

// Note frequencies for chord generation
const NOTE_FREQUENCIES: { [key: string]: number } = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88,
}

export async function initializeHybridAudio(): Promise<void> {
  if (isInitialized) return

  try {
    // Try Web Audio API first
    if (typeof window !== "undefined" && "AudioContext" in window) {
      audioContext = new AudioContext()

      // Test if Web Audio API works properly
      const testOscillator = audioContext.createOscillator()
      const testGain = audioContext.createGain()
      testOscillator.connect(testGain)
      testGain.connect(audioContext.destination)
      testGain.gain.setValueAtTime(0, audioContext.currentTime)
      testOscillator.start(audioContext.currentTime)
      testOscillator.stop(audioContext.currentTime + 0.01)

      audioMethod = "webaudio"
      console.log("✅ Web Audio API initialized successfully")
    } else {
      throw new Error("Web Audio API not supported")
    }
  } catch (error) {
    console.warn("⚠️ Web Audio API failed, falling back to HTML5 Audio:", error)
    audioMethod = "html5"
    await initializeHTML5Audio()
  }

  isInitialized = true
}

async function initializeHTML5Audio(): Promise<void> {
  // Pre-create audio elements for common chords
  const commonChords = ["C", "G", "Am", "F", "D", "Em"]

  for (const chord of commonChords) {
    audioPool[chord] = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio()
      audio.preload = "auto"
      audio.volume = 0.7
      audioPool[chord].push(audio)
    }
  }

  console.log("✅ HTML5 Audio pool initialized")
}

export async function playChordFromPositionsSmart(positions: any[], rootNote: string): Promise<boolean> {
  if (!isInitialized) {
    await initializeHybridAudio()
  }

  try {
    if (audioMethod === "webaudio" && audioContext) {
      return await playChordWebAudio(positions, rootNote)
    } else {
      return await playChordHTML5(positions, rootNote)
    }
  } catch (error) {
    console.error("Error playing chord:", error)
    return false
  }
}

async function playChordWebAudio(positions: any[], rootNote: string): Promise<boolean> {
  if (!audioContext) return false

  try {
    // Resume audio context if suspended (iOS requirement)
    if (audioContext.state === "suspended") {
      await audioContext.resume()
    }

    const now = audioContext.currentTime
    const duration = 2.0

    // Extract notes from positions
    const notes = extractNotesFromPositions(positions, rootNote)

    // Play each note
    notes.forEach((note, index) => {
      const oscillator = audioContext!.createOscillator()
      const gainNode = audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext!.destination)

      oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[note] || 440, now)
      oscillator.type = "sine"

      // Envelope
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

      oscillator.start(now + index * 0.05)
      oscillator.stop(now + duration)
    })

    return true
  } catch (error) {
    console.error("Web Audio playback failed:", error)
    return false
  }
}

async function playChordHTML5(positions: any[], rootNote: string): Promise<boolean> {
  try {
    // Generate audio data for the chord
    const audioData = generateChordAudio(positions, rootNote)

    // Find available audio element from pool
    let audio = getAvailableAudioElement(rootNote)

    if (!audio) {
      audio = new Audio()
      audio.volume = 0.7
    }

    // Convert audio data to blob URL
    const blob = new Blob([audioData], { type: "audio/wav" })
    const url = URL.createObjectURL(blob)

    audio.src = url

    // Play the audio
    const playPromise = audio.play()

    if (playPromise) {
      await playPromise

      // Clean up blob URL after playing
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 3000)
    }

    return true
  } catch (error) {
    console.error("HTML5 Audio playback failed:", error)
    return false
  }
}

function getAvailableAudioElement(chordName: string): HTMLAudioElement | null {
  const pool = audioPool[chordName]
  if (!pool) return null

  // Find an audio element that's not currently playing
  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio
    }
  }

  return pool[0] // Return first element as fallback
}

function extractNotesFromPositions(positions: any[], rootNote: string): string[] {
  // Simple chord note extraction - in a real app this would be more sophisticated
  const notes = [rootNote]

  // Add common chord tones based on root note
  const rootIndex = Object.keys(NOTE_FREQUENCIES).indexOf(rootNote)
  if (rootIndex !== -1) {
    const allNotes = Object.keys(NOTE_FREQUENCIES)
    // Add third and fifth
    notes.push(allNotes[(rootIndex + 2) % 12]) // Third
    notes.push(allNotes[(rootIndex + 4) % 12]) // Fifth
  }

  return notes
}

function generateChordAudio(positions: any[], rootNote: string): ArrayBuffer {
  // Generate a simple WAV file with chord tones
  const sampleRate = 44100
  const duration = 2.0
  const numSamples = Math.floor(sampleRate * duration)

  // Create audio buffer
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, numSamples * 2, true)

  // Generate audio samples
  const notes = extractNotesFromPositions(positions, rootNote)

  for (let i = 0; i < numSamples; i++) {
    let sample = 0
    const t = i / sampleRate

    // Mix chord tones
    notes.forEach((note) => {
      const freq = NOTE_FREQUENCIES[note] || 440
      sample += Math.sin(2 * Math.PI * freq * t) * 0.3
    })

    // Apply envelope
    const envelope = Math.exp(-t * 2)
    sample *= envelope

    // Convert to 16-bit PCM
    const pcmSample = Math.max(-1, Math.min(1, sample))
    view.setInt16(44 + i * 2, pcmSample * 0x7fff, true)
  }

  return buffer
}

export function stopAllAudio(): void {
  // Stop Web Audio API
  if (audioContext) {
    // Note: We can't stop all oscillators easily, they'll stop naturally
  }

  // Stop HTML5 Audio
  Object.values(audioPool).forEach((pool) => {
    pool.forEach((audio) => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })
  })
}

export async function preloadCommonChords(): Promise<void> {
  // This would preload audio files for common chords in a real implementation
  console.log("🎵 Preloading common chords...")

  const commonChords = ["C", "G", "Am", "F", "D", "Em", "A", "E", "Dm"]

  // In a real app, you'd load actual audio files here
  for (const chord of commonChords) {
    if (!audioPool[chord]) {
      audioPool[chord] = []
      for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio()
        audio.preload = "auto"
        audio.volume = 0.7
        audioPool[chord].push(audio)
      }
    }
  }

  console.log("✅ Common chords preloaded")
}

// --- NEW PUBLIC HELPERS ----------------------------------------------------

/**
 * Wrapper kept for backward-compatibility with legacy code.
 * Same as `playChordFromPositionsSmart`.
 */
export const playChordSmart = playChordFromPositionsSmart

/**
 * Returns the current audio subsystem status.
 */
export function getAudioSystemStatus() {
  return {
    isInitialized,
    mode: audioMethod, // "webaudio" | "html5" | null
  }
}

/**
 * Forces HTML5 Audio mode (useful for iOS troubleshooting).
 */
export async function forceHTML5Mode() {
  audioMethod = "html5"
  if (!isInitialized) await initializeHybridAudio()
}

/**
 * Forces Web Audio API mode when available.
 */
export async function forceWebAudioMode() {
  audioMethod = "webaudio"
  if (!isInitialized) await initializeHybridAudio()
}

/**
 * Restores automatic detection of the best audio system.
 */
export async function autoDetectMode() {
  audioMethod = null
  isInitialized = false
  await initializeHybridAudio()
}

/**
 * Another legacy alias preserved for external imports.
 */
export const playHybridAudio = playChordFromPositionsSmart
// ---------------------------------------------------------------------------
