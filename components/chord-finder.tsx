"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Music, Clock, Play, Volume2, Heart } from "lucide-react"
import { getChordData } from "@/lib/chord-utils"
import { getTranslatedChordDescription } from "@/lib/chord-libraries"
import { playChordFromPositionsSmart, stopAllAudio } from "@/lib/audio-utils-hybrid"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { addFavoriteChord, removeFavoriteChord, isChordFavorite } from "@/lib/local-storage"
import { useChordHistory } from "@/hooks/use-chord-history"
import { toast } from "sonner"
import ChordDiagram from "./chord-diagram"
import MiniChordDiagram from "./mini-chord-diagram"
import { Chord } from "tonal"
import { playChordHTML5 } from "@/lib/audio-html5-fallback"

interface ChordFinderProps {
  onChordSelect?: (chord: string) => void
}

const COMMON_CHORDS = [
  "C",
  "Cm",
  "C7",
  "Cmaj7",
  "D",
  "Dm",
  "D7",
  "Dmaj7",
  "E",
  "Em",
  "E7",
  "Emaj7",
  "F",
  "Fm",
  "F7",
  "Fmaj7",
  "G",
  "Gm",
  "G7",
  "Gmaj7",
  "A",
  "Am",
  "A7",
  "Amaj7",
  "B",
  "Bm",
  "B7",
  "Bmaj7",
]

const EXAMPLE_CHORDS = ["C", "Am", "F", "G", "Em", "Dm", "A7", "E7", "Cmaj7", "Fmaj7"]

export default function ChordFinder({ onChordSelect }: ChordFinderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChord, setSelectedChord] = useState("C")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const { user } = useAuth()
  const { addToHistory } = useChordHistory()
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
  const { t } = useLanguage()

  const chordData = getChordData(selectedChord)
  const tonalChordData = Chord.get(selectedChord)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentChordSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (user && selectedChord && chordData) {
      const favorited = isChordFavorite(user.id, selectedChord, chordData.type || "major")
      setIsFavorited(favorited)
    }
  }, [user, selectedChord, chordData])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const chord = searchTerm.trim()
      setSelectedChord(chord)
      onChordSelect?.(chord)
      addToHistory(chord)

      // Add to recent searches
      const newRecent = [chord, ...recentSearches.filter((c) => c !== chord)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem("recentChordSearches", JSON.stringify(newRecent))

      setSearchTerm("")
    }
  }

  const handleChordClick = (chord: string) => {
    setSelectedChord(chord)
    onChordSelect?.(chord)
    addToHistory(chord)

    // Add to recent searches
    const newRecent = [chord, ...recentSearches.filter((c) => c !== chord)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem("recentChordSearches", JSON.stringify(newRecent))
  }

  const handlePlayChord = async (positions: any[]) => {
    stopAllAudio()
    setIsPlaying(true)

    try {
      // Use HTML5 audio system for better iOS compatibility
      const success = await playChordHTML5(selectedChord)
      if (!success) {
        // Fallback to hybrid system
        const fallbackSuccess = await playChordFromPositionsSmart(positions, selectedChord.charAt(0))
        if (!fallbackSuccess) {
          toast.error("Could not play audio. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error playing chord:", error)
      toast.error("Audio playback failed.")
    }

    setTimeout(() => setIsPlaying(false), 2000)
  }

  const toggleFavorite = () => {
    if (!user || !chordData) {
      toast.error(t("msg.sign-in-to-save"))
      return
    }

    const chordType = chordData.type || "major"
    const rootNote = selectedChord.charAt(0)

    if (isFavorited) {
      removeFavoriteChord(user.id, selectedChord, chordType)
      setIsFavorited(false)
      toast.success(t("msg.removed-from-favorites"))
    } else {
      addFavoriteChord(user.id, selectedChord, chordType, rootNote)
      setIsFavorited(true)
      toast.success(t("msg.added-to-favorites"))
    }
  }

  const insertAtCursor = (text: string) => {
    if (!inputRef) return

    const start = inputRef.selectionStart || 0
    const end = inputRef.selectionEnd || 0
    const currentValue = searchTerm
    
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end)
    setSearchTerm(newValue)
    
    // Set cursor position after inserted text and refocus
    setTimeout(() => {
      if (inputRef) {
        inputRef.focus()
        inputRef.setSelectionRange(start + text.length, start + text.length)
      }
    }, 0)
  }

  const getRelatedChords = (chordName: string) => {
    const root = chordName.charAt(0)
    const related = []

    // Add basic variations of the same root
    const variations = [`${root}`, `${root}m`, `${root}7`, `${root}maj7`]
    variations.forEach((chord) => {
      if (chord !== chordName && getChordData(chord)) {
        related.push(chord)
      }
    })

    // Add common progressions using manual progressions
    const progressions: { [key: string]: string[] } = {
      C: ["Am", "F", "G", "Em", "Dm"],
      G: ["Em", "C", "D", "Am", "Bm"],
      D: ["Bm", "G", "A", "Em", "F#m"],
      A: ["F#m", "D", "E", "Bm", "C#m"],
      E: ["C#m", "A", "B", "F#m", "G#m"],
      F: ["Dm", "Bb", "C", "Am", "Gm"],
      Am: ["C", "F", "G", "Em", "Dm"],
      Em: ["G", "C", "D", "Am", "Bm"],
      Dm: ["F", "Bb", "C", "Am", "Gm"],
    }

    if (progressions[root]) {
      progressions[root].forEach((chord) => {
        if (chord !== chordName && !related.includes(chord) && getChordData(chord)) {
          related.push(chord)
        }
      })
    }

    // If we still don't have enough, add some common chords
    if (related.length < 4) {
      const commonChords = ["C", "G", "Am", "F", "D", "Em", "A", "E"]
      commonChords.forEach((chord) => {
        if (chord !== chordName && !related.includes(chord) && related.length < 6) {
          related.push(chord)
        }
      })
    }

    return related.slice(0, 6)
  }

  if (!chordData) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <p>{t("analysis.chord-not-found")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Section 1: Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
{t("ui.search")} {t("common.chord")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={setInputRef}
              placeholder={t("chord-finder.search-placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              {t("ui.search")}
            </Button>
          </div>

          {/* Chord Helper Buttons */}
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700">Quick Insert:</h4>
            
            {/* Category 1: Accidentals */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">Accidentals</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertAtCursor("#")}
                  className="h-10 px-3 text-sm shrink-0 hover:bg-blue-50 border-blue-200"
                >
                  #
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertAtCursor("b")}
                  className="h-10 px-3 text-sm shrink-0 hover:bg-blue-50 border-blue-200"
                >
                  ♭
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertAtCursor("ø")}
                  className="h-10 px-3 text-sm shrink-0 hover:bg-blue-50 border-blue-200"
                >
                  ø
                </Button>
              </div>
            </div>

            {/* Category 2: Numbers */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">Numbers</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["5", "6", "7", "9", "11", "13"].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => insertAtCursor(num)}
                    className="h-10 px-3 text-sm shrink-0 hover:bg-green-50 border-green-200"
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category 3: Basic Types */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">Basic Types</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["maj", "min", "dim", "aug", "sus", "add"].map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => insertAtCursor(type)}
                    className="h-10 px-3 text-sm shrink-0 hover:bg-purple-50 border-purple-200"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category 4: Common Combinations */}
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-medium">Combinations</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["maj7", "min7", "dim7", "sus2", "sus4", "add9"].map((combo) => (
                  <Button
                    key={combo}
                    variant="outline"
                    size="sm"
                    onClick={() => insertAtCursor(combo)}
                    className="h-10 px-3 text-sm shrink-0 hover:bg-orange-50 border-orange-200"
                  >
                    {combo}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  inputRef?.focus()
                }}
                className="h-10 px-4 text-sm hover:bg-red-50 border-red-200 text-red-600"
              >
                Clear Input
              </Button>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t("chord-finder.popular-chords")}:</h4>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHORDS.map((chord) => (
                <Button
                  key={chord}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChordClick(chord)}
                  className="text-xs"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
{t("chord-finder.recent-searches")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((chord) => (
                  <Button
                    key={chord}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleChordClick(chord)}
                    className="text-xs"
                  >
                    {chord}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Chord Fingering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5" />
{chordData.name} - {t("variations.fingering-options")}
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button onClick={toggleFavorite} variant="ghost" size="sm" className="text-gray-600 hover:text-red-500">
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chordData.variations && chordData.variations.length > 0 ? (
            <div className="grid gap-6">
              {chordData.variations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Chord Diagram */}
                    <div className="flex justify-center lg:justify-start">
                      <div className="bg-amber-50 rounded-lg p-4">
                        <ChordDiagram positions={variation.positions} />
                      </div>
                    </div>

                    {/* Chord Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{variation.name}</h3>
                        <Badge
                          variant={
                            variation.difficulty === "Beginner"
                              ? "default"
                              : variation.difficulty === "Intermediate"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {variation.difficulty}
                        </Badge>
                      </div>

                      {(variation.description || variation.descriptionKey) && (
                        <p className="text-sm text-muted-foreground">
                          {getTranslatedChordDescription(variation, t, selectedChord)}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handlePlayChord(variation.positions)}
                          disabled={isPlaying}
                          className="gap-2"
                        >
                          {isPlaying ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
{isPlaying ? t("chord-finder.playing") : t("chord-finder.play")}
                        </Button>

                        {variation.startFret && variation.startFret > 1 && (
                          <span className="text-sm text-muted-foreground">{t("content.starting-fret")} {variation.startFret}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No fingering variations available for this chord.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Music Theory */}
      <Card>
        <CardHeader>
          <CardTitle>{t("section.music-theory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information using Tonal.js */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">{t("section.chord-notes")}</h4>
              <div className="flex flex-wrap gap-2">
                {tonalChordData.notes?.map((note: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {note}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
{t("variations.individual-notes", { chord: tonalChordData.name || selectedChord })}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">{t("section.interval-formula")}</h4>
              <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                {tonalChordData.intervals?.join("-") || "1-3-5"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                The interval relationships between notes in the chord.
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">{t("section.chord-analysis")}</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    Type
                  </Badge>
                  <div>
                    <p className="font-medium">{getChordQualityDisplay(tonalChordData.quality || "Unknown", selectedChord, t)} {t("common.chord")}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDetailedChordDescription(tonalChordData.quality || "major", selectedChord, t)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
{t("analysis.semitones")}
                  </Badge>
                  <div>
                    <p className="font-medium">{tonalChordData.semitones?.join(", ") || "0, 4, 7"}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("analysis.semitone-distances")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {t("analysis.function")}
                  </Badge>
                  <div>
                    <p className="font-medium">{getChordFunction(selectedChord)}</p>
                    <p className="text-sm text-muted-foreground">{getChordFunctionDescription(selectedChord, t)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Progressions */}
            <div>
              <h4 className="font-medium mb-3">{t("section.common-progressions")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCommonProgressions(selectedChord, t).map((progression, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {progression.name}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {progression.chords.map((chord, i) => (
                        <span key={i} className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {chord}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{progression.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Playing Tips */}
            <div>
              <h4 className="font-medium mb-3">{t("section.playing-tips")}</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {getPlayingTips(selectedChord, chordData, t).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Related Chords */}
      <Card>
        <CardHeader>
          <CardTitle>{t("section.related-chords")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {getRelatedChords(selectedChord).map((relatedChord) => {
              const relatedData = getChordData(relatedChord)
              const relatedTonal = Chord.get(relatedChord)
              return (
                <div
                  key={relatedChord}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChordClick(relatedChord)}
                >
                  <div className="text-center space-y-2">
                    <div className="bg-gray-100 rounded p-2">
                      {relatedData?.variations?.[0]?.positions ? (
                        <MiniChordDiagram positions={relatedData.variations[0].positions} />
                      ) : (
                        <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                          No diagram
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{relatedChord}</h4>
                      <p className="text-xs text-muted-foreground">
                        {relatedTonal.notes?.join(", ") || relatedData?.notes?.join(", ") || ""}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced helper functions using Tonal.js where possible
function getChordQualityDisplay(quality: string, chordName: string, t: (key: string, params?: Record<string, string>) => string): string {
  // Get chord data from Tonal.js to check type when quality is Unknown
  const tonalChord = Chord.get(chordName)
  const chordType = tonalChord.type || ""
  
  // Handle Unknown quality cases by checking type
  if (quality === "Unknown") {
    // Suspended chords
    if (chordType.includes("suspended") || chordName.toLowerCase().includes("sus")) {
      return t("common.suspended")
    }
    // Eleventh chords  
    if (chordType.includes("eleventh") || chordName.toLowerCase().includes("11")) {
      return t("common.eleventh")
    }
    // Add chords (when type is null but chord name contains "add")
    if (chordName.toLowerCase().includes("add")) {
      return t("common.add")
    }
  }
  
  // Map other known qualities to translations
  const qualityMap: { [key: string]: string } = {
    "Major": "common.major",
    "Minor": "common.minor",
    "Dominant 7th": "common.dominant-7th",
    "Major 7th": "common.major-7th",
    "Minor 7th": "common.minor-7th",
    "Diminished": "common.diminished",
    "Augmented": "common.augmented"
  }
  
  const translationKey = qualityMap[quality]
  if (translationKey) {
    return t(translationKey)
  }
  
  return quality || t("analysis.unknown")
}

function getDetailedChordDescription(quality: string, chordName: string, t: (key: string, params?: Record<string, string>) => string): string {
  const root = chordName.charAt(0)
  
  // Get chord data from Tonal.js to check type when quality is Unknown
  const tonalChord = Chord.get(chordName)
  const chordType = tonalChord.type || ""
  
  // Map quality names to translation keys
  const qualityKeyMap: { [key: string]: string } = {
    "Major": "major",
    "Minor": "minor", 
    "Dominant 7th": "dominant-7th",
    "Major 7th": "major-7th",
    "Minor 7th": "minor-7th",
    "Suspended": "suspended",
    "Diminished": "diminished",
    "Augmented": "augmented"
  }
  
  // Handle Unknown quality cases by checking type
  if (quality === "Unknown") {
    // Suspended chords
    if (chordType.includes("suspended") || chordName.toLowerCase().includes("sus")) {
      return t("chord-explanations.suspended", { root, quality: "suspended" })
    }
    // Eleventh chords
    if (chordType.includes("eleventh") || chordName.toLowerCase().includes("11")) {
      return t("chord-explanations.eleventh", { root, quality: "eleventh" })
    }
    // Add chords
    if (chordName.toLowerCase().includes("add")) {
      return t("chord-explanations.add", { root, quality: "add" })
    }
  }

  const translationKey = qualityKeyMap[quality]
  if (translationKey) {
    return t(`chord-explanations.${translationKey}`, { root, quality })
  }
  
  return t("chord-explanations.default", { quality: quality.toLowerCase() })
}

function getChordFunction(chordName: string): string {
  const root = chordName.charAt(0)
  // This could be enhanced with Tonal.js scale analysis
  const functions: { [key: string]: string } = {
    C: "Tonic (I)",
    F: "Subdominant (IV)",
    G: "Dominant (V)",
    D: "Tonic (I)",
    A: "Dominant (V)",
    E: "Tonic (I)",
    B: "Dominant (V)",
  }
  return functions[root] || "Variable Function"
}

function getChordFunctionDescription(chordName: string, t: (key: string) => string): string {
  const func = getChordFunction(chordName)
  const descriptions: { [key: string]: string } = {
    "Tonic (I)": t("theory.tonic-desc"),
    "Subdominant (IV)": t("theory.subdominant-desc"),
    "Dominant (V)": t("theory.dominant-desc"),
    "Variable Function": t("theory.variable-desc"),
  }
  return descriptions[func] || t("theory.default-desc")
}

function getCommonProgressions(chordName: string, t: (key: string) => string): Array<{ name: string; chords: string[]; description: string }> {
  const root = chordName.charAt(0)
  const progressions: { [key: string]: Array<{ name: string; chords: string[]; description: string }> } = {
    C: [
      {
        name: "I-V-vi-IV",
        chords: ["C", "G", "Am", "F"],
        description: t("progression-desc.i-v-vi-iv"),
      },
      { name: "ii-V-I", chords: ["Dm", "G", "C"], description: t("progression-desc.ii-v-i") },
    ],
    G: [
      { name: "I-V-vi-IV", chords: ["G", "D", "Em", "C"], description: t("progression-desc.classic-rock") },
      { name: "I-vi-ii-V", chords: ["G", "Em", "Am", "D"], description: t("progression-desc.circle-fifths") },
    ],
    Am: [
      { name: "i-VII-VI-VII", chords: ["Am", "G", "F", "G"], description: t("progression-desc.natural-minor") },
      { name: "i-iv-V-i", chords: ["Am", "Dm", "E", "Am"], description: t("progression-desc.harmonic-minor") },
    ],
    F: [
      { name: "I-V-vi-IV", chords: ["F", "C", "Dm", "Bb"], description: t("progression-desc.folk-country") },
      { name: "I-vi-IV-V", chords: ["F", "Dm", "Bb", "C"], description: t("progression-desc.fifties") },
    ],
  }
  return (
    progressions[root] || [
      { name: "Basic Triad", chords: [chordName], description: t("progression-desc.basic-triad") },
    ]
  )
}

function getPlayingTips(chordName: string, chordData: any, t: (key: string) => string): string[] {
  const tips = []

  // General tips based on chord type
  if (chordName.includes("F") && !chordName.includes("#")) {
    tips.push(t("tips.barre-chord"))
  }

  if (chordName.includes("B") && !chordName.includes("b")) {
    tips.push(t("tips.b-major"))
  }

  if (chordName.includes("7")) {
    tips.push(t("analysis.seventh-chords"))
  }

  if (chordName.includes("m") && !chordName.includes("maj")) {
    tips.push(t("tips.minor-comfort"))
  }

  // Add difficulty-based tips
  if (chordData.variations && chordData.variations[0]?.difficulty === "Beginner") {
    tips.push(t("tips.beginner-friendly"))
  }

  if (chordData.variations && chordData.variations.some((v: any) => v.difficulty === "Advanced")) {
    tips.push(t("tips.advanced-available"))
  }

  // Universal tips
  tips.push(t("tips.practice-slowly"))
  tips.push(t("tips.clean-notes"))

  return tips.slice(0, 4) // Limit to 4 tips to avoid overwhelming
}
