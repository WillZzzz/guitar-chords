// iPhone-compatible audio utilities - ULTRA-ROBUST VERSION

// Define the frequencies for each note (in Hz)
const noteFrequencies: Record<string, number> = {
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  Gb2: 92.5,
  G2: 98.0,
  "G#2": 103.83,
  Ab2: 103.83,
  A2: 110.0,
  "A#2": 116.54,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  Db3: 138.59,
  D3: 146.83,
  "D#3": 155.56,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  Gb3: 185.0,
  G3: 196.0,
  "G#3": 207.65,
  Ab3: 207.65,
  A3: 220.0,
  "A#3": 233.08,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  Db4: 277.18,
  D4: 293.66,
  "D#4": 311.13,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  Gb4: 369.99,
  G4: 392.0,
  "G#4": 415.3,
  Ab4: 415.3,
  A4: 440.0,
  "A#4": 466.16,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  Db5: 554.37,
  D5: 587.33,
  "D#5": 622.25,
  Eb5: 622.25,
  E5: 659.25,
}

// Standard guitar tuning (from low to high)
const standardTuning = ["E2", "A2", "D3", "G3", "B3", "E4"]

// Global audio state
let audioContext: AudioContext | null = null
let isAudioUnlocked = false
let isIOS = false
let unlockAttempts = 0
const MAX_UNLOCK_ATTEMPTS = 3

// More comprehensive iOS detection
function detectIOS(): boolean {
  if (typeof window === "undefined") return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ""

  // Check for explicit iOS devices
  const isExplicitIOS = /ipad|iphone|ipod/.test(userAgent)

  // Check for iPad masquerading as Mac
  const isPadOnMac = platform.includes("mac") && navigator.maxTouchPoints > 1

  // Check for Safari on iOS (but not Chrome or Firefox)
  const isSafariIOS = /safari/.test(userAgent) && !/chrome|firefox|edge/.test(userAgent) && /mobile/.test(userAgent)

  isIOS = isExplicitIOS || isPadOnMac || isSafariIOS
  console.log("iOS detection:", { isExplicitIOS, isPadOnMac, isSafariIOS, result: isIOS })
  return isIOS
}

// Create audio context only when needed
function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) {
      console.error("AudioContext not supported")
      return null
    }

    const context = new AudioContextClass({
      sampleRate: 44100,
      latencyHint: "interactive",
    })

    console.log("Audio context created:", {
      state: context.state,
      sampleRate: context.sampleRate,
      baseLatency: context.baseLatency,
    })

    return context
  } catch (error) {
    console.error("Failed to create audio context:", error)
    return null
  }
}

// Test if audio context can actually play sound
async function testAudioContext(ctx: AudioContext): Promise<boolean> {
  try {
    // Create a very short test tone
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Very quiet test
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime)
    oscillator.frequency.setValueAtTime(440, ctx.currentTime)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)

    // Wait for test to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    return ctx.state === "running"
  } catch (error) {
    console.error("Audio context test failed:", error)
    return false
  }
}

// Robust audio unlock for iOS
export async function unlockAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false

  detectIOS()

  // Limit unlock attempts
  if (unlockAttempts >= MAX_UNLOCK_ATTEMPTS) {
    console.log("Max unlock attempts reached")
    return isAudioUnlocked
  }

  unlockAttempts++
  console.log(`Audio unlock attempt ${unlockAttempts}/${MAX_UNLOCK_ATTEMPTS}`)

  try {
    // Create context if it doesn't exist
    if (!audioContext) {
      audioContext = createAudioContext()
      if (!audioContext) {
        console.error("Could not create audio context")
        return false
      }
    }

    console.log("Audio context state before unlock:", audioContext.state)

    // Resume context if suspended
    if (audioContext.state === "suspended") {
      console.log("Resuming suspended audio context...")
      await audioContext.resume()

      // Wait for resume to complete
      let attempts = 0
      while (audioContext.state === "suspended" && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        attempts++
      }

      console.log("Audio context state after resume:", audioContext.state)
    }

    // Test if audio actually works
    const canPlay = await testAudioContext(audioContext)

    if (canPlay && audioContext.state === "running") {
      isAudioUnlocked = true
      console.log("Audio successfully unlocked!")
      return true
    } else {
      console.log("Audio unlock failed - context not running or test failed")
      return false
    }
  } catch (error) {
    console.error("Audio unlock error:", error)
    return false
  }
}

// Map chord positions to actual notes
export function positionsToNotes(positions: any[], rootNote: string): string[] {
  if (!positions || positions.length === 0) {
    console.log("No positions provided")
    return []
  }

  const notes: string[] = []

  // Process each string (6 to 1)
  for (let stringNum = 6; stringNum >= 1; stringNum--) {
    const stringPosition = positions.find((p) => p.string === stringNum)

    if (!stringPosition || stringPosition.fret === -1) {
      continue // Skip muted strings
    }

    const stringIndex = 6 - stringNum
    const openStringNote = standardTuning[stringIndex]

    if (stringPosition.fret === 0) {
      // Open string
      notes.push(openStringNote)
    } else {
      // Fretted note
      const semitones = stringPosition.fret
      const noteNames = Object.keys(noteFrequencies)
      const openNoteIndex = noteNames.indexOf(openStringNote)

      if (openNoteIndex !== -1) {
        const newNoteIndex = openNoteIndex + semitones
        if (newNoteIndex < noteNames.length) {
          notes.push(noteNames[newNoteIndex])
        }
      }
    }
  }

  console.log("Generated notes:", notes)
  return notes
}

// Play a single note with enhanced error handling
function playNote(frequency: number, startTime: number, duration: number, volume = 0.08): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = audioContext
    if (!ctx) {
      reject(new Error("No audio context"))
      return
    }

    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filterNode = ctx.createBiquadFilter()

      // Create a more guitar-like sound
      oscillator.type = "sawtooth"
      oscillator.frequency.setValueAtTime(frequency, startTime)

      // Add filtering for more natural sound
      filterNode.type = "lowpass"
      filterNode.frequency.setValueAtTime(frequency * 2.5, startTime)
      filterNode.Q.setValueAtTime(0.8, startTime)

      // Connect the nodes
      oscillator.connect(filterNode)
      filterNode.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Create envelope
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      // Handle oscillator end
      oscillator.onended = () => resolve()

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)

      // Fallback timeout
      setTimeout(() => resolve(), (duration + 0.1) * 1000)
    } catch (error) {
      console.error("Error playing note:", error)
      reject(error)
    }
  })
}

// Enhanced chord playing with better error handling
export async function playChord(notes: string[], strum = true): Promise<boolean> {
  if (typeof window === "undefined") return false

  detectIOS()

  try {
    console.log("Attempting to play chord with notes:", notes)

    // Ensure we have an audio context
    if (!audioContext) {
      audioContext = createAudioContext()
      if (!audioContext) {
        console.error("Could not create audio context")
        return false
      }
    }

    // For iOS, ensure audio is unlocked
    if (isIOS && (!isAudioUnlocked || audioContext.state !== "running")) {
      console.log("Unlocking audio for iOS...")
      const unlocked = await unlockAudio()
      if (!unlocked) {
        console.log("Failed to unlock audio")
        return false
      }
    }

    // Final check that context is ready
    if (audioContext.state !== "running") {
      console.log("Audio context not running:", audioContext.state)
      return false
    }

    const now = audioContext.currentTime
    const duration = 1.8

    const validNotes = notes.filter((note) => {
      const hasFreq = noteFrequencies[note] !== undefined
      if (!hasFreq) {
        console.log(`No frequency found for note: ${note}`)
      }
      return hasFreq
    })

    if (validNotes.length === 0) {
      console.log("No valid notes to play")
      return false
    }

    console.log("Playing valid notes:", validNotes)

    // Play notes
    const playPromises: Promise<void>[] = []

    if (strum) {
      // Strum with slight delay between notes
      const strumDelay = 0.06
      validNotes.forEach((note, index) => {
        const frequency = noteFrequencies[note]
        const startTime = now + index * strumDelay
        const noteDuration = duration - index * strumDelay
        playPromises.push(playNote(frequency, startTime, noteDuration, 0.08))
      })
    } else {
      // Play all notes simultaneously
      validNotes.forEach((note) => {
        const frequency = noteFrequencies[note]
        playPromises.push(playNote(frequency, now, duration, 0.06))
      })
    }

    // Wait for all notes to start playing
    await Promise.allSettled(playPromises)

    console.log("Chord playback initiated successfully")
    return true
  } catch (error) {
    console.error("Error playing chord:", error)
    return false
  }
}

// Play a chord based on positions
export async function playChordFromPositions(positions: any[], rootNote: string): Promise<boolean> {
  const notes = positionsToNotes(positions, rootNote)
  if (notes.length === 0) {
    console.log("No notes generated from positions")
    return false
  }
  return await playChord(notes, true)
}

// Stop all sounds
export function stopAllSounds(): void {
  if (audioContext) {
    try {
      // For iOS, just suspend instead of closing
      if (isIOS) {
        audioContext.suspend()
      } else {
        audioContext.close()
        audioContext = null
        isAudioUnlocked = false
        unlockAttempts = 0
      }
    } catch (error) {
      console.error("Error stopping audio:", error)
    }
  }
}

// Initialize audio system
export function initializeAudio(): void {
  if (typeof window === "undefined") return

  detectIOS()
  console.log("Audio system initialized for", isIOS ? "iOS" : "desktop")

  // Set up event listeners for first user interaction
  const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown", "click"]

  const unlock = async () => {
    console.log("User interaction detected, attempting audio unlock...")

    try {
      const success = await unlockAudio()
      if (success) {
        console.log("Audio unlocked successfully on user interaction")
        // Remove event listeners after successful unlock
        unlockEvents.forEach((eventType) => {
          document.removeEventListener(eventType, unlock, true)
        })
      }
    } catch (error) {
      console.error("Error during audio unlock:", error)
    }
  }

  // Add event listeners
  unlockEvents.forEach((eventType) => {
    document.addEventListener(eventType, unlock, true)
  })

  console.log("Audio unlock listeners added")
}

// Get audio system status for debugging
export function getAudioStatus() {
  return {
    isIOS,
    isAudioUnlocked,
    unlockAttempts,
    contextState: audioContext?.state || "none",
    contextExists: !!audioContext,
  }
}
