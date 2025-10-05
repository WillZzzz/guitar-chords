"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getDebugLogs,
  exportDebugLogs,
  clearDebugLogs,
  getDetailedAudioStatus,
  unlockAudio,
  playChord,
} from "@/lib/audio-utils"
import { Download, Trash2, RefreshCw, Play, Bug } from "lucide-react"
import { toast } from "sonner"

export default function AudioDebugPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [audioStatus, setAudioStatus] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  const refreshData = () => {
    setLogs(getDebugLogs())
    setAudioStatus(getDetailedAudioStatus())
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleExportLogs = () => {
    try {
      const logData = exportDebugLogs()
      const blob = new Blob([logData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audio-debug-${new Date().toISOString().slice(0, 19)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Debug logs exported!")
    } catch (error) {
      toast.error("Failed to export logs")
    }
  }

  const handleClearLogs = () => {
    clearDebugLogs()
    refreshData()
    toast.success("Debug logs cleared!")
  }

  const handleTestAudio = async () => {
    try {
      await unlockAudio()
      await playChord(["C4", "E4", "G4"], false)
      toast.success("Test audio played")
    } catch (error) {
      toast.error("Test audio failed")
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800"
      case "warn":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="gap-2 bg-white/90 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Audio Debug Panel</CardTitle>
          <div className="flex gap-2">
            <Button onClick={refreshData} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleTestAudio} size="sm" variant="outline">
              <Play className="h-4 w-4" />
            </Button>
            <Button onClick={handleExportLogs} size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={handleClearLogs} size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)] overflow-hidden">
          <Tabs defaultValue="status" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="h-[calc(100%-40px)] overflow-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Audio Context</h3>
                    {audioStatus?.audioContext ? (
                      <div className="space-y-1 text-sm">
                        <div>
                          State:{" "}
                          <Badge
                            className={
                              audioStatus.audioContext.state === "running"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {audioStatus.audioContext.state}
                          </Badge>
                        </div>
                        <div>Sample Rate: {audioStatus.audioContext.sampleRate}Hz</div>
                        <div>Base Latency: {audioStatus.audioContext.baseLatency?.toFixed(3)}s</div>
                        <div>Output Latency: {audioStatus.audioContext.outputLatency?.toFixed(3)}s</div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">No audio context</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">System Status</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        iOS:{" "}
                        <Badge
                          className={audioStatus?.isIOS ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                        >
                          {audioStatus?.isIOS ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        Unlocked:{" "}
                        <Badge
                          className={
                            audioStatus?.isAudioUnlocked ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {audioStatus?.isAudioUnlocked ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        Unlock Active:{" "}
                        <Badge
                          className={
                            audioStatus?.unlockPromiseActive
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {audioStatus?.unlockPromiseActive ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="h-[calc(100%-40px)] overflow-auto">
              <div className="space-y-2">
                {logs
                  .slice()
                  .reverse()
                  .map((log, index) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getLogLevelColor(log.level)}>{log.level}</Badge>
                        <Badge variant="outline">{log.category}</Badge>
                        <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                      </div>
                      <div className="font-medium">{log.message}</div>
                      {log.data && (
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="export" className="h-[calc(100%-40px)] overflow-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Export Instructions</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Try to play a chord on your iPhone</li>
                    <li>Click "Export Logs" to download the debug data</li>
                    <li>Send the downloaded JSON file for analysis</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quick Tests</h3>
                  <div className="space-y-2">
                    <Button onClick={handleTestAudio} className="w-full">
                      Test Audio (C Major Chord)
                    </Button>
                    <Button onClick={() => unlockAudio()} variant="outline" className="w-full">
                      Force Audio Unlock
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Debug panel will capture all audio-related events and errors.</p>
                  <p>Logs include device info, audio context state, and detailed error messages.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
