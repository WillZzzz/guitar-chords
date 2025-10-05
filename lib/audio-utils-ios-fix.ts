// ULTRA-AGGRESSIVE iOS Safari Audio Fix
// This addresses the specific bug where AudioContext appears "running" but produces no sound

let audioContext: AudioContext | null = null
let isAudioUnlocked = false
let unlockAttempts = 0
const MAX_UNLOCK_ATTEMPTS = 5

// Multiple iOS-specific unlock strategies
async function createIOSAudioContext(): Promise<AudioContext | null> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null

    // Strategy 1: Force specific sample rate
    const context = new AudioContextClass({
      sampleRate: 44100,
      latencyHint: "interactive",
    })

    console.log("iOS AudioContext created:", {
      state: context.state,
      sampleRate: context.sampleRate,
      destination: context.destination.channelCount,
      baseLatency: context.baseLatency,
      outputLatency: context.outputLatency,
    })

    return context
  } catch (error) {
    console.error("Failed to create iOS AudioContext:", error)
    return null
  }
}

// NUCLEAR OPTION: Force iOS Safari to actually output audio
async function nuclearIOSUnlock(context: AudioContext): Promise<boolean> {
  console.log(`🚀 NUCLEAR iOS unlock attempt ${unlockAttempts + 1}/${MAX_UNLOCK_ATTEMPTS}`)

  try {
    // Step 1: Multiple aggressive resume attempts
    for (let i = 0; i < 5; i++) {
      if (context.state === "running") break

      console.log(`💥 Resume attempt ${i + 1}`)
      await context.resume()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Force a microtask
      await Promise.resolve()
    }

    // Step 2: Create LOUD test sounds with multiple strategies
    const strategies = [
      { type: "sine", freq: 440, vol: 0.8, dur: 0.2 },
      { type: "square", freq: 880, vol: 0.6, dur: 0.15 },
      { type: "sawtooth", freq: 220, vol: 0.7, dur: 0.1 },
      { type: "triangle", freq: 660, vol: 0.5, dur: 0.1 },
    ]

    for (const strategy of strategies) {
      try {
        await forceIOSAudioOutput(context, strategy)
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.warn(`Strategy ${strategy.type} failed:`, error)
      }
    }

    // Step 3: Create complex audio graph to force initialization
    try {
      const oscillator1 = context.createOscillator()
      const oscillator2 = context.createOscillator()
      const gainNode = context.createGain()
      const analyser = context.createAnalyser()
      const compressor = context.createDynamicsCompressor()

      // Complex routing
      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(compressor)
      compressor.connect(analyser)
      analyser.connect(context.destination)

      // Different frequencies
      oscillator1.frequency.value = 440
      oscillator2.frequency.value = 554.37 // C#5
      oscillator1.type = "sine"
      oscillator2.type = "triangle"

      gainNode.gain.value = 0.4 // LOUD

      const now = context.currentTime
      oscillator1.start(now)
      oscillator2.start(now)
      oscillator1.stop(now + 0.3)
      oscillator2.stop(now + 0.3)

      console.log("🎵 Complex audio graph created and played")
      await new Promise((resolve) => setTimeout(resolve, 350))
    } catch (error) {
      console.warn("Complex audio graph failed:", error)
    }

    // Step 4: Force destination connection test
    try {
      const testOsc = context.createOscillator()
      const testGain = context.createGain()

      testOsc.connect(testGain)
      testGain.connect(context.destination)

      testOsc.frequency.value = 1000 // High frequency
      testGain.gain.value = 0.9 // VERY LOUD
      testOsc.type = "square" // Harsh sound

      const now = context.currentTime
      testOsc.start(now)
      testOsc.stop(now + 0.1)

      console.log("🔊 Destination connection test completed")
      await new Promise((resolve) => setTimeout(resolve, 150))
    } catch (error) {
      console.warn("Destination test failed:", error)
    }

    // Step 5: Final verification with timeout
    await new Promise((resolve) => setTimeout(resolve, 200))

    const isWorking = context.state === "running" && context.currentTime > 0
    console.log("🎯 Nuclear unlock result:", {
      state: context.state,
      currentTime: context.currentTime,
      isWorking,
      sampleRate: context.sampleRate,
      destination: context.destination.channelCount,
    })

    return isWorking
  } catch (error) {
    console.error("💥 Nuclear iOS unlock failed:", error)
    return false
  }
}

// Force audio output with specific strategy
async function forceIOSAudioOutput(
  context: AudioContext,
  strategy: { type: string; freq: number; vol: number; dur: number },
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.frequency.value = strategy.freq
      oscillator.type = strategy.type as OscillatorType

      const now = context.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(strategy.vol, now + 0.01) // LOUD and FAST
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + strategy.dur)

      oscillator.onended = () => {
        console.log(`🎵 ${strategy.type} @ ${strategy.freq}Hz completed`)
        resolve()
      }

      oscillator.start(now)
      oscillator.stop(now + strategy.dur)

      // Fallback timeout
      setTimeout(() => resolve(), strategy.dur * 1000 + 100)
    } catch (error) {
      reject(error)
    }
  })
}

// Main iOS audio unlock function
export async function unlockIOSAudio(): Promise<boolean> {
  console.log("🚀 Starting NUCLEAR iOS audio unlock process")

  if (isAudioUnlocked && audioContext?.state === "running") {
    console.log("✅ Audio already unlocked")
    return true
  }

  unlockAttempts++

  try {
    // Create or get audio context
    if (!audioContext) {
      audioContext = await createIOSAudioContext()
      if (!audioContext) {
        console.error("❌ Failed to create audio context")
        return false
      }
    }

    // Attempt nuclear unlock
    const success = await nuclearIOSUnlock(audioContext)

    if (success) {
      isAudioUnlocked = true
      console.log("🎉 NUCLEAR iOS audio unlock successful!")
      return true
    } else if (unlockAttempts < MAX_UNLOCK_ATTEMPTS) {
      console.log(`⚠️ Nuclear unlock failed, attempt ${unlockAttempts}/${MAX_UNLOCK_ATTEMPTS}`)
      // Reset context for next attempt
      audioContext = null
      return false
    } else {
      console.error("💀 iOS audio unlock failed after maximum attempts")
      return false
    }
  } catch (error) {
    console.error("💥 iOS audio unlock error:", error)
    return false
  }
}

// LOUD note playing for iOS
export async function playIOSNote(frequency: number, duration = 1.0): Promise<boolean> {
  try {
    if (!isAudioUnlocked) {
      const unlocked = await unlockIOSAudio()
      if (!unlocked) return false
    }

    if (!audioContext || audioContext.state !== "running") {
      console.error("❌ Audio context not ready")
      return false
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sawtooth" // More aggressive sound

    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.6, now + 0.02) // MUCH LOUDER
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)

    console.log(`🎵 LOUD iOS note played: ${frequency}Hz`)
    return true
  } catch (error) {
    console.error("❌ Error playing iOS note:", error)
    return false
  }
}

// LOUD chord playing for iOS
export async function playIOSChord(frequencies: number[]): Promise<boolean> {
  try {
    if (!isAudioUnlocked) {
      const unlocked = await unlockIOSAudio()
      if (!unlocked) return false
    }

    if (!audioContext || audioContext.state !== "running") {
      console.error("❌ Audio context not ready for chord")
      return false
    }

    const now = audioContext.currentTime
    const duration = 2.0

    for (let i = 0; i < frequencies.length; i++) {
      const frequency = frequencies[i]
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sawtooth" // More aggressive

      // Staggered start for strumming effect
      const startTime = now + i * 0.05
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02) // LOUD
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    console.log(`🎸 LOUD iOS chord played: ${frequencies.join(", ")}Hz`)
    return true
  } catch (error) {
    console.error("❌ Error playing iOS chord:", error)
    return false
  }
}

// Get audio status
export function getIOSAudioStatus() {
  return {
    hasContext: !!audioContext,
    contextState: audioContext?.state || "none",
    isUnlocked: isAudioUnlocked,
    unlockAttempts,
    currentTime: audioContext?.currentTime || 0,
    sampleRate: audioContext?.sampleRate || 0,
    destination: audioContext?.destination.channelCount || 0,
  }
}
