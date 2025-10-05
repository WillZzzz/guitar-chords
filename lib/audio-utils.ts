// iPhone-compatible audio utilities with TIMEOUT HANDLING and better error recovery

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

// Global audio context and state
let audioContext: AudioContext | null = null
let isAudioUnlocked = false
let isIOS = false
let unlockPromise: Promise<boolean> | null = null

// DEBUGGING SYSTEM
interface DebugLog {
  timestamp: number
  level: "info" | "warn" | "error"
  category: string
  message: string
  data?: any
}

const debugLogs: DebugLog[] = []
const MAX_LOGS = 200

function addDebugLog(level: "info" | "warn" | "error", category: string, message: string, data?: any) {
  const log: DebugLog = {
    timestamp: Date.now(),
    level,
    category,
    message,
    data: data ? JSON.parse(JSON.stringify(data)) : undefined,
  }

  debugLogs.push(log)
  if (debugLogs.length > MAX_LOGS) {
    debugLogs.shift()
  }

  // Also log to console with prefix
  const prefix = `[AUDIO-DEBUG-${level.toUpperCase()}]`
  console.log(prefix, category, message, data || "")
}

// Export debug logs
export function getDebugLogs(): DebugLog[] {
  return [...debugLogs]
}

export function exportDebugLogs(): string {
  const deviceInfo = getDeviceInfo()
  const audioStatus = getDetailedAudioStatus()

  const report = {
    timestamp: new Date().toISOString(),
    deviceInfo,
    audioStatus,
    logs: debugLogs,
  }

  return JSON.stringify(report, null, 2)
}

export function clearDebugLogs(): void {
  debugLogs.length = 0
  addDebugLog("info", "DEBUG", "Debug logs cleared")
}

// Device detection with comprehensive logging
function getDeviceInfo() {
  if (typeof window === "undefined") return { platform: "server" }

  const info = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    connection: (navigator as any).connection?.effectiveType,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    screenSize: `${screen.width}x${screen.height}`,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  addDebugLog("info", "DEVICE", "Device info collected", info)
  return info
}

// Enhanced iOS detection with detailed logging
function detectIOS(): boolean {
  if (typeof window === "undefined") {
    addDebugLog("warn", "IOS_DETECT", "Window undefined, assuming non-iOS")
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ""

  // Multiple detection methods
  const checks = {
    explicitIOS: /ipad|iphone|ipod/.test(userAgent),
    iPadMasquerading: platform.includes("mac") && navigator.maxTouchPoints > 1,
    safariMobile: /safari/.test(userAgent) && /mobile/.test(userAgent) && !/chrome|firefox|edge/.test(userAgent),
    touchDevice: navigator.maxTouchPoints > 0,
    vendor: navigator.vendor?.includes("Apple"),
    standalone: (window.navigator as any).standalone !== undefined,
  }

  const detectedIOS = checks.explicitIOS || checks.iPadMasquerading || checks.safariMobile

  addDebugLog("info", "IOS_DETECT", "iOS detection results", {
    userAgent,
    platform,
    checks,
    result: detectedIOS,
  })

  isIOS = detectedIOS
  return detectedIOS
}

// Audio context creation with detailed logging
function initAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    addDebugLog("error", "AUDIO_INIT", "Window undefined")
    return null
  }

  try {
    if (!audioContext) {
      addDebugLog("info", "AUDIO_INIT", "Creating new audio context")

      // Check for AudioContext support
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        addDebugLog("error", "AUDIO_INIT", "AudioContext not supported")
        return null
      }

      // Create context with options
      const options = {
        sampleRate: 44100,
        latencyHint: "interactive" as AudioContextLatencyCategory,
      }

      audioContext = new AudioContextClass(options)

      addDebugLog("info", "AUDIO_INIT", "Audio context created", {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate,
        baseLatency: audioContext.baseLatency,
        outputLatency: audioContext.outputLatency,
        destination: {
          channelCount: audioContext.destination.channelCount,
          channelCountMode: audioContext.destination.channelCountMode,
          channelInterpretation: audioContext.destination.channelInterpretation,
        },
      })

      // Add state change listener
      audioContext.addEventListener("statechange", () => {
        addDebugLog("info", "AUDIO_STATE", "Audio context state changed", {
          newState: audioContext?.state,
          timestamp: Date.now(),
        })
      })
    }

    return audioContext
  } catch (error) {
    addDebugLog("error", "AUDIO_INIT", "Failed to create audio context", {
      error: error.message,
      stack: error.stack,
    })
    return null
  }
}

// TIMEOUT WRAPPER FUNCTION
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      addDebugLog("error", "TIMEOUT", `Operation timed out: ${operation}`, { timeoutMs })
      reject(new Error(`Timeout: ${operation} took longer than ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

// Enhanced audio unlock with TIMEOUT HANDLING
export async function unlockAudio(): Promise<boolean> {
  addDebugLog("info", "UNLOCK", "Audio unlock requested")

  if (typeof window === "undefined") {
    addDebugLog("error", "UNLOCK", "Window undefined")
    return false
  }

  // If unlock is already in progress, wait for it with timeout
  if (unlockPromise) {
    addDebugLog("info", "UNLOCK", "Unlock already in progress, waiting with timeout...")
    try {
      return await withTimeout(unlockPromise, 10000, "existing unlock promise")
    } catch (error) {
      addDebugLog("error", "UNLOCK", "Existing unlock promise timed out, resetting", {
        error: error.message,
      })
      // Reset the stuck promise
      unlockPromise = null
      isAudioUnlocked = false
    }
  }

  // Start new unlock process with timeout
  unlockPromise = withTimeout(performAudioUnlock(), 8000, "audio unlock process")

  try {
    const result = await unlockPromise
    unlockPromise = null
    addDebugLog("info", "UNLOCK", "Audio unlock completed", { success: result })
    return result
  } catch (error) {
    addDebugLog("error", "UNLOCK", "Audio unlock failed or timed out", {
      error: error.message,
    })
    unlockPromise = null
    isAudioUnlocked = false
    return false
  }
}

async function performAudioUnlock(): Promise<boolean> {
  const startTime = Date.now()
  addDebugLog("info", "UNLOCK_PERFORM", "Starting audio unlock process")

  detectIOS()

  try {
    // Step 1: Get or create audio context
    addDebugLog("info", "UNLOCK_PERFORM", "Step 1: Getting audio context")
    const ctx = initAudioContext()
    if (!ctx) {
      addDebugLog("error", "UNLOCK_PERFORM", "No audio context available")
      return false
    }

    addDebugLog("info", "UNLOCK_PERFORM", "Audio context state before unlock", {
      state: ctx.state,
      currentTime: ctx.currentTime,
    })

    // Step 2: Resume if suspended (with timeout)
    if (ctx.state === "suspended") {
      addDebugLog("info", "UNLOCK_PERFORM", "Step 2: Resuming suspended context")

      try {
        await withTimeout(ctx.resume(), 3000, "context resume")
        addDebugLog("info", "UNLOCK_PERFORM", "Context resume completed", {
          newState: ctx.state,
        })
      } catch (error) {
        addDebugLog("error", "UNLOCK_PERFORM", "Context resume failed or timed out", {
          error: error.message,
          state: ctx.state,
        })
        // Try alternative approach
        addDebugLog("info", "UNLOCK_PERFORM", "Trying alternative unlock approach")
      }

      // Wait a bit more and check state
      await new Promise((resolve) => setTimeout(resolve, 100))
      addDebugLog("info", "UNLOCK_PERFORM", "Context state after resume attempt", {
        state: ctx.state,
      })
    }

    // Step 3: Create and play test sound (with timeout and error handling)
    addDebugLog("info", "UNLOCK_PERFORM", "Step 3: Creating test sound")

    try {
      const testSoundPromise = new Promise<boolean>((resolve, reject) => {
        try {
          const oscillator = ctx.createOscillator()
          const gainNode = ctx.createGain()

          addDebugLog("info", "UNLOCK_PERFORM", "Audio nodes created", {
            oscillatorType: oscillator.type,
            gainValue: gainNode.gain.value,
          })

          // Connect nodes
          oscillator.connect(gainNode)
          gainNode.connect(ctx.destination)

          addDebugLog("info", "UNLOCK_PERFORM", "Audio nodes connected")

          // Configure sound (very quiet)
          const now = ctx.currentTime
          gainNode.gain.setValueAtTime(0.001, now)
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)
          oscillator.frequency.setValueAtTime(440, now)

          addDebugLog("info", "UNLOCK_PERFORM", "Audio parameters set", {
            frequency: 440,
            startTime: now,
            duration: 0.1,
          })

          // Set up event handlers
          let soundStarted = false
          let soundEnded = false

          oscillator.onended = () => {
            soundEnded = true
            addDebugLog("info", "UNLOCK_PERFORM", "Test sound ended")
            resolve(true)
          }

          // Fallback timeout for sound completion
          setTimeout(() => {
            if (!soundEnded) {
              addDebugLog("warn", "UNLOCK_PERFORM", "Test sound timeout, assuming completed")
              resolve(true)
            }
          }, 500)

          // Start and stop sound
          oscillator.start(now)
          soundStarted = true
          addDebugLog("info", "UNLOCK_PERFORM", "Test sound started")

          oscillator.stop(now + 0.1)
          addDebugLog("info", "UNLOCK_PERFORM", "Test sound stop scheduled")
        } catch (error) {
          addDebugLog("error", "UNLOCK_PERFORM", "Error in test sound creation", {
            error: error.message,
          })
          reject(error)
        }
      })

      // Wait for test sound with timeout
      await withTimeout(testSoundPromise, 2000, "test sound playback")
      addDebugLog("info", "UNLOCK_PERFORM", "Test sound completed successfully")
    } catch (error) {
      addDebugLog("warn", "UNLOCK_PERFORM", "Test sound failed, continuing anyway", {
        error: error.message,
      })
      // Don't fail the entire unlock process if test sound fails
    }

    // Step 4: Final verification
    addDebugLog("info", "UNLOCK_PERFORM", "Step 4: Final verification")

    // Wait a bit for everything to settle
    await new Promise((resolve) => setTimeout(resolve, 100))

    const finalState = ctx.state
    const unlockSuccess = finalState === "running" || finalState === "suspended"

    addDebugLog("info", "UNLOCK_PERFORM", "Unlock verification completed", {
      finalState,
      unlockSuccess,
      totalTime: Date.now() - startTime,
    })

    if (unlockSuccess) {
      isAudioUnlocked = true
      addDebugLog("info", "UNLOCK_PERFORM", "Audio unlock successful!")
    } else {
      addDebugLog("warn", "UNLOCK_PERFORM", "Audio unlock uncertain - context state unclear")
      // On iOS, sometimes suspended is OK after user interaction
      if (isIOS && finalState === "suspended") {
        isAudioUnlocked = true
        addDebugLog("info", "UNLOCK_PERFORM", "Accepting suspended state on iOS as unlocked")
      }
    }

    return isAudioUnlocked
  } catch (error) {
    addDebugLog("error", "UNLOCK_PERFORM", "Audio unlock error", {
      error: error.message,
      stack: error.stack,
      totalTime: Date.now() - startTime,
    })
    return false
  }
}

// Enhanced note mapping with logging
export function positionsToNotes(positions: any[], rootNote: string): string[] {
  addDebugLog("info", "NOTE_MAP", "Converting positions to notes", {
    positionsCount: positions?.length || 0,
    rootNote,
    positions,
  })

  if (!positions || positions.length === 0) {
    addDebugLog("warn", "NOTE_MAP", "No positions provided")
    return []
  }

  const notes: string[] = []

  // Process each string (6 to 1)
  for (let stringNum = 6; stringNum >= 1; stringNum--) {
    const stringPosition = positions.find((p) => p.string === stringNum)

    if (!stringPosition || stringPosition.fret === -1) {
      addDebugLog("info", "NOTE_MAP", `String ${stringNum}: muted`)
      continue
    }

    const stringIndex = 6 - stringNum
    const openStringNote = standardTuning[stringIndex]

    if (stringPosition.fret === 0) {
      notes.push(openStringNote)
      addDebugLog("info", "NOTE_MAP", `String ${stringNum}: open (${openStringNote})`)
    } else {
      const semitones = stringPosition.fret
      const noteNames = Object.keys(noteFrequencies)
      const openNoteIndex = noteNames.indexOf(openStringNote)

      if (openNoteIndex !== -1) {
        const newNoteIndex = openNoteIndex + semitones
        if (newNoteIndex < noteNames.length) {
          const frettedNote = noteNames[newNoteIndex]
          notes.push(frettedNote)
          addDebugLog("info", "NOTE_MAP", `String ${stringNum}: fret ${semitones} (${frettedNote})`)
        } else {
          addDebugLog("warn", "NOTE_MAP", `String ${stringNum}: fret ${semitones} out of range`)
        }
      } else {
        addDebugLog("error", "NOTE_MAP", `String ${stringNum}: unknown open note ${openStringNote}`)
      }
    }
  }

  addDebugLog("info", "NOTE_MAP", "Note mapping completed", {
    resultNotes: notes,
    noteCount: notes.length,
  })

  return notes
}

// Enhanced note playing with detailed logging
function playNote(frequency: number, startTime: number, duration: number, volume = 0.12): void {
  addDebugLog("info", "PLAY_NOTE", "Playing single note", {
    frequency,
    startTime,
    duration,
    volume,
  })

  const ctx = audioContext
  if (!ctx) {
    addDebugLog("error", "PLAY_NOTE", "No audio context available")
    return
  }

  try {
    // Create nodes
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filterNode = ctx.createBiquadFilter()

    addDebugLog("info", "PLAY_NOTE", "Audio nodes created for note")

    // Configure oscillator
    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // Configure filter
    filterNode.type = "lowpass"
    filterNode.frequency.setValueAtTime(frequency * 3, startTime)
    filterNode.Q.setValueAtTime(1, startTime)

    // Connect nodes
    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(ctx.destination)

    addDebugLog("info", "PLAY_NOTE", "Audio nodes connected for note")

    // Create envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, startTime + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    addDebugLog("info", "PLAY_NOTE", "Envelope configured for note")

    // Add event listeners
    oscillator.onended = () => {
      addDebugLog("info", "PLAY_NOTE", "Note ended", { frequency })
    }

    // Start and stop
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)

    addDebugLog("info", "PLAY_NOTE", "Note scheduled to play", {
      frequency,
      actualStartTime: startTime,
      actualStopTime: startTime + duration,
    })
  } catch (error) {
    addDebugLog("error", "PLAY_NOTE", "Error playing note", {
      frequency,
      error: error.message,
      stack: error.stack,
    })
  }
}

// Enhanced chord playing with comprehensive logging and better iOS handling
export async function playChord(notes: string[], strum = true): Promise<boolean> {
  const startTime = Date.now()
  addDebugLog("info", "PLAY_CHORD", "Chord play requested", {
    notes,
    strum,
    notesCount: notes.length,
  })

  if (typeof window === "undefined") {
    addDebugLog("error", "PLAY_CHORD", "Window undefined")
    return false
  }

  detectIOS()

  try {
    // Step 1: Get audio context
    addDebugLog("info", "PLAY_CHORD", "Step 1: Getting audio context")
    const ctx = initAudioContext()
    if (!ctx) {
      addDebugLog("error", "PLAY_CHORD", "No audio context available")
      return false
    }

    addDebugLog("info", "PLAY_CHORD", "Audio context status", {
      state: ctx.state,
      currentTime: ctx.currentTime,
      isAudioUnlocked,
    })

    // Step 2: Unlock audio for iOS (with timeout)
    if (isIOS && (!isAudioUnlocked || ctx.state === "suspended")) {
      addDebugLog("info", "PLAY_CHORD", "Step 2: Unlocking audio for iOS")
      const unlocked = await unlockAudio()
      if (!unlocked) {
        addDebugLog("error", "PLAY_CHORD", "Failed to unlock audio")
        return false
      }
    }

    // Step 3: Ensure context is ready
    if (ctx.state === "suspended") {
      addDebugLog("info", "PLAY_CHORD", "Step 3: Resuming suspended context")
      try {
        await withTimeout(ctx.resume(), 2000, "context resume for playback")
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        addDebugLog("warn", "PLAY_CHORD", "Context resume failed, continuing anyway", {
          error: error.message,
        })
      }
    }

    addDebugLog("info", "PLAY_CHORD", "Context state before playback", {
      state: ctx.state,
    })

    // Step 4: Validate notes
    addDebugLog("info", "PLAY_CHORD", "Step 4: Validating notes")
    const validNotes = notes.filter((note) => {
      const hasFreq = noteFrequencies[note] !== undefined
      if (!hasFreq) {
        addDebugLog("warn", "PLAY_CHORD", `Invalid note: ${note}`)
      }
      return hasFreq
    })

    if (validNotes.length === 0) {
      addDebugLog("error", "PLAY_CHORD", "No valid notes to play")
      return false
    }

    addDebugLog("info", "PLAY_CHORD", "Valid notes to play", {
      validNotes,
      validCount: validNotes.length,
      invalidCount: notes.length - validNotes.length,
    })

    // Step 5: Play notes
    addDebugLog("info", "PLAY_CHORD", "Step 5: Playing notes")
    const now = ctx.currentTime
    const duration = 2.0

    if (strum) {
      const strumDelay = 0.08
      addDebugLog("info", "PLAY_CHORD", "Playing strummed chord", {
        strumDelay,
        totalDuration: duration,
      })

      validNotes.forEach((note, index) => {
        const frequency = noteFrequencies[note]
        const startTime = now + index * strumDelay
        const noteDuration = duration - index * strumDelay

        addDebugLog("info", "PLAY_CHORD", `Scheduling note ${index + 1}/${validNotes.length}`, {
          note,
          frequency,
          startTime,
          noteDuration,
        })

        playNote(frequency, startTime, noteDuration, 0.1)
      })
    } else {
      addDebugLog("info", "PLAY_CHORD", "Playing simultaneous chord")
      validNotes.forEach((note, index) => {
        const frequency = noteFrequencies[note]

        addDebugLog("info", "PLAY_CHORD", `Scheduling simultaneous note ${index + 1}/${validNotes.length}`, {
          note,
          frequency,
        })

        playNote(frequency, now, duration, 0.08)
      })
    }

    addDebugLog("info", "PLAY_CHORD", "Chord playback initiated successfully", {
      totalTime: Date.now() - startTime,
      notesPlayed: validNotes.length,
    })

    return true
  } catch (error) {
    addDebugLog("error", "PLAY_CHORD", "Error playing chord", {
      error: error.message,
      stack: error.stack,
      totalTime: Date.now() - startTime,
    })
    return false
  }
}

// Play a chord based on positions with logging
export async function playChordFromPositions(positions: any[], rootNote: string): Promise<boolean> {
  addDebugLog("info", "PLAY_POSITIONS", "Playing chord from positions", {
    positionsCount: positions?.length || 0,
    rootNote,
  })

  const notes = positionsToNotes(positions, rootNote)
  if (notes.length === 0) {
    addDebugLog("error", "PLAY_POSITIONS", "No notes generated from positions")
    return false
  }

  return await playChord(notes, true)
}

// Enhanced stop function with logging
export function stopAllSounds(): void {
  addDebugLog("info", "STOP", "Stopping all sounds")

  if (audioContext) {
    try {
      if (isIOS) {
        addDebugLog("info", "STOP", "Suspending audio context (iOS)")
        audioContext.suspend()
      } else {
        addDebugLog("info", "STOP", "Closing audio context (non-iOS)")
        audioContext.close()
        audioContext = null
        isAudioUnlocked = false
      }
    } catch (error) {
      addDebugLog("error", "STOP", "Error stopping audio", {
        error: error.message,
      })
    }
  } else {
    addDebugLog("info", "STOP", "No audio context to stop")
  }
}

// Enhanced initialization with logging
export function initializeAudio(): void {
  addDebugLog("info", "INIT", "Initializing audio system")

  if (typeof window === "undefined") {
    addDebugLog("error", "INIT", "Window undefined")
    return
  }

  const deviceInfo = getDeviceInfo()
  detectIOS()

  addDebugLog("info", "INIT", "Audio system initialized", {
    isIOS,
    deviceInfo: {
      userAgent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      maxTouchPoints: deviceInfo.maxTouchPoints,
    },
  })

  // Set up event listeners for first user interaction
  const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown", "click"]

  const unlock = async (event: Event) => {
    addDebugLog("info", "INIT", "User interaction detected", {
      eventType: event.type,
      target: event.target?.constructor.name,
    })

    try {
      const success = await unlockAudio()
      if (success) {
        addDebugLog("info", "INIT", "Audio unlocked on user interaction")
        // Remove event listeners after successful unlock
        unlockEvents.forEach((eventType) => {
          document.removeEventListener(eventType, unlock, true)
        })
      } else {
        addDebugLog("warn", "INIT", "Failed to unlock audio on user interaction")
      }
    } catch (error) {
      addDebugLog("error", "INIT", "Error during audio unlock", {
        error: error.message,
      })
    }
  }

  // Add event listeners
  unlockEvents.forEach((eventType) => {
    document.addEventListener(eventType, unlock, true)
  })

  addDebugLog("info", "INIT", "Audio unlock listeners added", {
    events: unlockEvents,
  })
}

// Detailed audio status for debugging
export function getDetailedAudioStatus() {
  const status = {
    audioContext: audioContext
      ? {
          state: audioContext.state,
          currentTime: audioContext.currentTime,
          sampleRate: audioContext.sampleRate,
          baseLatency: audioContext.baseLatency,
          outputLatency: audioContext.outputLatency,
        }
      : null,
    isAudioUnlocked,
    isIOS,
    unlockPromiseActive: !!unlockPromise,
    timestamp: Date.now(),
  }

  addDebugLog("info", "STATUS", "Audio status requested", status)
  return status
}

// Simple status function for backward compatibility
export function getAudioStatus(): string {
  if (!audioContext) {
    return "No audio context available"
  }
  return audioContext.state
}
