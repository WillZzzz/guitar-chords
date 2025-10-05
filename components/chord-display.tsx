"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Play, Volume2 } from "lucide-react"
import ChordDiagram from "./chord-diagram"
import ChordTheory from "./chord-theory"
import RelatedChords from "./related-chords"
import { playHybridAudio } from "@/lib/audio-utils-hybrid"
import { useAuth } from "@/contexts/auth-context"
import { toggleFavoriteChord, getFavoriteChords } from "@/lib/local-storage"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"

interface ChordDisplayProps {
  chord: any
  onChordSelect?: (chordName: string) => void
}

export default function ChordDisplay({ chord, onChordSelect }: ChordDisplayProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (chord) {
      const favorites = getFavoriteChords()
      setIsFavorite(favorites.some((fav) => fav.name === chord.name && fav.type === chord.type))
    }
  }, [chord])

  const handleFavorite = () => {
    if (!chord) return

    const newFavoriteState = toggleFavoriteChord({
      name: chord.name,
      type: chord.type,
      fingering: chord.fingering,
      difficulty: chord.difficulty,
    })

    setIsFavorite(newFavoriteState)
    toast.success(newFavoriteState ? t("addedToFavorites") : t("removedFromFavorites"))
  }

  const handlePlay = async () => {
    if (!chord || isPlaying) return

    setIsPlaying(true)
    try {
      await playHybridAudio(chord.name, chord.type)
    } catch (error) {
      console.error("Error playing chord:", error)
      toast.error("Could not play chord audio")
    } finally {
      setTimeout(() => setIsPlaying(false), 1000)
    }
  }

  if (!chord) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("selectChord")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Chord Header */}
      <Card className="overflow-hidden border-0 shadow-2xl">
        <CardHeader className="relative p-0 h-32">
          {/* Multi-layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

          {/* Floating decorative elements */}
          <div className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-6 left-12 w-8 h-8 bg-yellow-300/20 rounded-full blur-lg" />
          <div className="absolute top-8 left-1/3 w-12 h-12 bg-pink-400/15 rounded-full blur-lg" />

          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-between h-full px-8">
            <div className="flex items-center space-x-6">
              {/* Root note circle */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-2xl font-bold text-white tracking-tight">{chord.name}</span>
              </div>

              {/* Chord info */}
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
                  {chord.name}
                  {chord.type}
                </h2>
                <p className="text-white/80 text-sm font-medium">{chord.type === "" ? "Major" : chord.type} Chord</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handlePlay}
                disabled={isPlaying}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                onClick={handleFavorite}
                size="lg"
                variant="ghost"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Heart
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isFavorite ? "fill-red-400 text-red-400" : "text-white"
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chord Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chord Diagram */}
        <Card className="chord-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("chordDiagram")}</h3>
              <Badge variant="secondary" className="text-xs">
                {t("difficulty")}: {chord.difficulty}/5
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChordDiagram chord={chord} />
          </CardContent>
        </Card>

        {/* Chord Theory */}
        <Card className="chord-card">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold">{t("chordTheory")}</h3>
          </CardHeader>
          <CardContent>
            <ChordTheory chord={chord} />
          </CardContent>
        </Card>
      </div>

      {/* Related Chords */}
      <Card className="chord-card">
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold">{t("relatedChords")}</h3>
        </CardHeader>
        <CardContent>
          <RelatedChords currentChord={chord} onChordSelect={onChordSelect} />
        </CardContent>
      </Card>
    </div>
  )
}
