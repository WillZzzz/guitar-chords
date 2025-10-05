// Simplified iOS-compatible audio utilities

const noteFrequencies: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  E2: 82.41,
  A2: 110.0,
  D3: 146.83,
  G3: 196.0,
  B3: 246.94,
}

let audioContext: AudioContext | null = null

// Create audio context with iOS compatibility
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioContext = new AudioContextClass({
        sampleRate: 44100,
        latencyHint: "interactive",
      })

      console.log("Simple audio context created:", audioContext.state)
    } catch (error) {
      console.error("Failed to create simple audio context:", error)
      return null
    }
  }
  return audioContext
}

// Ultra-simple note playing - no complex processing
export async function playSimpleNote(frequency: number, duration = 1.0): Promise<boolean> {
  try {
    const ctx = getAudioContext()
    if (!ctx) return false

    // Resume if suspended
    if (ctx.state === "suspended") {
      await ctx.resume()
      // Wait a bit for resume to complete
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (ctx.state !== "running") {
      console.log("Audio context not running:", ctx.state)
      return false
    }

    // Create simple oscillator - no filters or complex processing
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Direct connection
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Simple settings
    oscillator.frequency.value = frequency
    oscillator.type = "sine" // Simplest waveform

    // Louder, simpler envelope
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02) // Louder volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    // Play the note
    oscillator.start(now)
    oscillator.stop(now + duration)

    console.log(`Simple note played: ${frequency}Hz for ${duration}s`)
    return true
  } catch (error) {
    console.error("Error playing simple note:", error)
    return false
  }
}

// Simple chord playing
export async function playSimpleChord(notes: string[]): Promise<boolean> {
  try {
    const ctx = getAudioContext()
    if (!ctx) return false

    // Resume if suspended
    if (ctx.state === "suspended") {
      await ctx.resume()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (ctx.state !== "running") {
      console.log("Audio context not running for chord:", ctx.state)
      return false
    }

    const now = ctx.currentTime
    const duration = 1.5

    // Play each note simultaneously with simple processing
    for (const note of notes) {
      const frequency = noteFrequencies[note]
      if (!frequency) continue

      // Create oscillator for each note
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      // Simple envelope - louder volume
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02) // Louder
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

      oscillator.start(now)
      oscillator.stop(now + duration)
    }

    console.log(`Simple chord played: ${notes.join(", ")}`)
    return true
  } catch (error) {
    console.error("Error playing simple chord:", error)
    return false
  }
}

// Test function for basic audio
export async function testBasicAudio(): Promise<boolean> {
  console.log("Testing basic audio...")
  return await playSimpleNote(440, 0.5) // A4 for half a second
}
