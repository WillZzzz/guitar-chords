"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  initializeHybridAudio,
  playChordSmart,
  getAudioSystemStatus,
  forceHTML5Mode,
  forceWebAudioMode,
  autoDetectMode,
  preloadCommonChords,
} from "@/lib/audio-utils-hybrid"
import { playChordHTML5, getHTML5AudioStatus, preloadChord } from "@/lib/audio-html5-fallback"
import { unlockAudio, playChord, getDetailedAudioStatus } from "@/lib/audio-utils"

export default function AudioTestPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>({})

  useEffect(() => {
    // Initialize on mount
    initializeHybridAudio()
    updateStatus()
  }, [])

  const updateStatus = () => {
    const status = {
      hybrid: getAudioSystemStatus(),
      html5: getHTML5AudioStatus(),
      webAudio: getDetailedAudioStatus(),
    }
    setSystemStatus(status)
  }

  const testHTML5Audio = async () => {
    setIsLoading(true)
    try {
      console.log("🧪 Testing HTML5 Audio...")
      const success = await playChordHTML5("C major")
      setTestResults((prev) => ({
        ...prev,
        html5: success ? "✅ Works" : "❌ Failed",
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        html5: `❌ Error: ${error}`,
      }))
    }
    setIsLoading(false)
    updateStatus()
  }

  const testWebAudio = async () => {
    setIsLoading(true)
    try {
      console.log("🧪 Testing Web Audio API...")
      await unlockAudio()
      const success = await playChord(["C4", "E4", "G4"], true)
      setTestResults((prev) => ({
        ...prev,
        webAudio: success ? "✅ Works" : "❌ Failed",
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        webAudio: `❌ Error: ${error}`,
      }))
    }
    setIsLoading(false)
    updateStatus()
  }

  const testSmartMode = async () => {
    setIsLoading(true)
    try {
      console.log("🧪 Testing Smart Detection...")
      const success = await playChordSmart("G major")
      setTestResults((prev) => ({
        ...prev,
        smart: success ? "✅ Works" : "❌ Failed",
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        smart: `❌ Error: ${error}`,
      }))
    }
    setIsLoading(false)
    updateStatus()
  }

  const testPreload = async () => {
    setIsLoading(true)
    try {
      console.log("🧪 Testing Preload...")
      await preloadChord("A minor")
      // Wait a moment then try to play
      setTimeout(async () => {
        const success = await playChordHTML5("A minor")
        setTestResults((prev) => ({
          ...prev,
          preload: success ? "✅ Works" : "❌ Failed",
        }))
        setIsLoading(false)
        updateStatus()
      }, 1000)
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        preload: `❌ Error: ${error}`,
      }))
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setTestResults({})
    await testHTML5Audio()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testWebAudio()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testSmartMode()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testPreload()
  }

  const preloadAll = async () => {
    setIsLoading(true)
    try {
      preloadCommonChords()
      setTestResults((prev) => ({
        ...prev,
        preloadAll: "✅ Started preloading common chords",
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        preloadAll: `❌ Error: ${error}`,
      }))
    }
    setIsLoading(false)
    updateStatus()
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsVisible(true)} variant="outline" size="sm" className="bg-white shadow-lg">
          🎵 Audio Test
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">🎵 Audio Test Panel</CardTitle>
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System Status */}
          <div className="space-y-2">
            <h4 className="font-medium">System Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant={systemStatus.hybrid?.preferredSystem === "html5" ? "default" : "secondary"}>
                Mode: {systemStatus.hybrid?.preferredSystem || "unknown"}
              </Badge>
              <Badge variant={systemStatus.html5?.initialized ? "default" : "destructive"}>
                HTML5: {systemStatus.html5?.initialized ? "Ready" : "Not Ready"}
              </Badge>
              <Badge variant={systemStatus.webAudio?.unlocked ? "default" : "secondary"}>
                Web Audio: {systemStatus.webAudio?.unlocked ? "Unlocked" : "Locked"}
              </Badge>
              <Badge variant="outline">Chords: {systemStatus.html5?.totalChords || 0}</Badge>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex justify-between">
                  <span className="capitalize">{test}:</span>
                  <span>{result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testHTML5Audio} disabled={isLoading} size="sm" variant="outline">
              Test HTML5
            </Button>
            <Button onClick={testWebAudio} disabled={isLoading} size="sm" variant="outline">
              Test Web Audio
            </Button>
            <Button onClick={testSmartMode} disabled={isLoading} size="sm" variant="outline">
              Test Smart
            </Button>
            <Button onClick={testPreload} disabled={isLoading} size="sm" variant="outline">
              Test Preload
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button onClick={runAllTests} disabled={isLoading} size="sm" className="w-full">
              {isLoading ? "Testing..." : "Run All Tests"}
            </Button>
            <Button onClick={preloadAll} disabled={isLoading} size="sm" variant="secondary" className="w-full">
              Preload Common Chords
            </Button>
          </div>

          {/* Mode Controls */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Force Mode</h4>
            <div className="grid grid-cols-3 gap-1">
              <Button
                onClick={() => {
                  forceHTML5Mode()
                  updateStatus()
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                HTML5
              </Button>
              <Button
                onClick={() => {
                  forceWebAudioMode()
                  updateStatus()
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Web Audio
              </Button>
              <Button
                onClick={() => {
                  autoDetectMode()
                  updateStatus()
                }}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Auto
              </Button>
            </div>
          </div>

          {/* Device Info */}
          <div className="text-xs text-muted-foreground">
            <div>Device: {systemStatus.html5?.shouldUseFallback ? "iOS/Safari" : "Desktop"}</div>
            <div>Audio Context: {systemStatus.html5?.hasAudioContext ? "Yes" : "No"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
