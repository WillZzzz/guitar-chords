"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, TestTube, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function AudioVolumeCheck() {
  const [isTestingIOS, setIsTestingIOS] = useState(false)
  const [isTestingBasic, setIsTestingBasic] = useState(false)

  // Test NUCLEAR iOS-specific audio fix
  const testIOSAudio = async () => {
    setIsTestingIOS(true)
    try {
      const { unlockIOSAudio, playIOSChord, getIOSAudioStatus } = await import("@/lib/audio-utils-ios-fix")

      console.log("🚀 Testing NUCLEAR iOS audio fix...")
      toast.info("🚀 Attempting NUCLEAR iOS unlock...")

      const unlocked = await unlockIOSAudio()

      if (unlocked) {
        toast.success("💥 NUCLEAR unlock successful! Playing LOUD test chord...")
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Play C major chord with LOUD frequencies
        const chordSuccess = await playIOSChord([261.63, 329.63, 392.0])
        if (chordSuccess) {
          toast.success("🎸 NUCLEAR chord test completed! Did you hear it?", {
            duration: 5000,
          })
        } else {
          toast.error("❌ NUCLEAR chord failed to play")
        }
      } else {
        toast.error("💀 NUCLEAR iOS audio unlock failed")
      }

      const status = getIOSAudioStatus()
      console.log("🎯 NUCLEAR iOS Audio Status:", status)
    } catch (error) {
      console.error("💥 NUCLEAR iOS audio test failed:", error)
      toast.error(`💥 NUCLEAR test failed: ${error.message}`)
    } finally {
      setTimeout(() => setIsTestingIOS(false), 2000)
    }
  }

  // Test basic audio (original method)
  const testBasicAudio = async () => {
    setIsTestingBasic(true)
    try {
      const { playChord } = await import("@/lib/audio-utils")
      const success = await playChord(["C4", "E4", "G4"], false)

      if (success) {
        toast.success("Basic audio test completed - did you hear a chord?")
      } else {
        toast.error("Basic audio test failed")
      }
    } catch (error) {
      console.error("Basic audio test failed:", error)
      toast.error(`Basic audio failed: ${error.message}`)
    } finally {
      setTimeout(() => setIsTestingBasic(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          iOS Audio Fix Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <strong>iOS Safari Bug Detected:</strong> Your audio context is getting stuck. Try the iOS-specific fix
              below.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={testIOSAudio}
            disabled={isTestingIOS}
            className="w-full bg-red-600 hover:bg-red-700"
            variant="default"
          >
            {isTestingIOS ? (
              <>
                <VolumeX className="h-4 w-4 mr-2 animate-pulse" />🚀 NUCLEAR iOS Test Running...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />🚀 NUCLEAR iOS Audio Fix
              </>
            )}
          </Button>

          <Button
            onClick={testBasicAudio}
            disabled={isTestingBasic}
            className="w-full bg-transparent"
            variant="outline"
          >
            {isTestingBasic ? (
              <>
                <VolumeX className="h-4 w-4 mr-2 animate-pulse" />
                Testing Original Method...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Test Original Method
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>🚀 NUCLEAR Fix:</strong> Ultra-aggressive unlock with LOUD audio
          </p>
          <p>
            <strong>Original:</strong> Current guitar chord system
          </p>
          <p>⚠️ The NUCLEAR fix will be LOUD - turn up your volume!</p>
        </div>
      </CardContent>
    </Card>
  )
}
