"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Music, Clock, Play, Volume2, Heart } from "lucide-react"
import { getChordData } from "@/lib/chord-utils"
import { getTranslatedChordDescription, ChordInfo } from "@/lib/chord-libraries"
import { playChordFromPositionsSmart, stopAllAudio } from "@/lib/audio-utils-hybrid"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { addFavoriteChord, removeFavoriteChord, isChordFavorite, addChordLookup } from "@/lib/user-data"
import { useChordHistory } from "@/hooks/use-chord-history"
import { toast } from "sonner"
import ChordDiagram from "./chord-diagram"
import MiniChordDiagram from "./mini-chord-diagram"
import ScaleDisplay from "./scale-display"
import NotePicker from "./note-picker"
import { Chord } from "tonal"
import { playChordHTML5 } from "@/lib/audio-html5-fallback"
import { analyzeChordScale } from "@/lib/scale-analysis"

interface ChordFinderProps {
  onChordSelect?: (chord: string) => void
  initialChord?: string
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

// Helper function to translate variation names
function translateVariationName(name: string, t: (key: string) => string): string {
  if (name === "Open Position") {
    return t("variations.open-position")
  }
  if (name.startsWith("Barre (") && name.endsWith("th fret)")) {
    const fretNumber = name.match(/Barre \((\d+)th fret\)/)?.[1]
    return `${t("variations.barre")} (${fretNumber}th fret)`
  }
  if (name.startsWith("Position (") && name.endsWith("th fret)")) {
    const fretNumber = name.match(/Position \((\d+)th fret\)/)?.[1] 
    return `${t("variations.position")} (${fretNumber}th fret)`
  }
  return name
}

export default function ChordFinder({ onChordSelect, initialChord }: ChordFinderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChord, setSelectedChord] = useState(initialChord || "C")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const { user } = useAuth()
  const { addToHistory } = useChordHistory()
  const { t } = useLanguage()

  const [activeSection, setActiveSection] = useState<"fingering" | "theory" | "related">("fingering")

  console.log(`🎵 ChordFinder: selectedChord = "${selectedChord}"`)
  
  // Use state for chord data to ensure proper re-rendering
  const [currentChordData, setCurrentChordData] = useState<ChordInfo | null>(null)
  
  useEffect(() => {
    console.log(`🎵 ChordFinder: useEffect triggered for selectedChord = "${selectedChord}"`)
    
    // Test chord-fingering library directly
    if (selectedChord === 'Gbmaj7') {
      console.log(`🧪 Direct test of chord-fingering library for Gbmaj7:`)
      try {
        const { findGuitarChord } = require('chord-fingering')
        const directResult = findGuitarChord('Gbmaj7')
        console.log(`🧪 Direct result:`, directResult ? {
          symbol: directResult.symbol,
          fingerings: directResult.fingerings?.length || 0,
          notes: directResult.notes
        } : 'null')
      } catch (error) {
        console.log(`🧪 Direct test error:`, error)
      }
    }
    
    const chordData = getChordData(selectedChord, t)
    console.log(`🎵 ChordFinder: chordData result =`, chordData ? `Found with ${chordData.variations?.length || 0} variations` : 'null')
    
    if (chordData && selectedChord === 'Gbmaj7') {
      console.log(`🎵 ChordFinder: Full chordData for Gbmaj7:`, {
        name: chordData.name,
        symbol: chordData.symbol,
        variationsCount: chordData.variations?.length,
        firstVariation: chordData.variations?.[0],
        notes: chordData.notes,
        quality: chordData.quality
      })
    }
    
    setCurrentChordData(chordData)
  }, [selectedChord])
  
  const chordData = currentChordData
  const tonalChordData = Chord.get(selectedChord)

  useEffect(() => {
    if (initialChord && initialChord !== selectedChord) {
      setSelectedChord(initialChord)
    }
  }, [initialChord])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentChordSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (user && selectedChord && chordData) {
      isChordFavorite(user.id, selectedChord)
        .then((favorited) => {
          if (!cancelled) setIsFavorited(favorited)
        })
        .catch(() => {})
    } else {
      setIsFavorited(false)
    }
    return () => {
      cancelled = true
    }
  }, [user, selectedChord, chordData])

  const recordLookup = (chord: string) => {
    addToHistory(chord)
    if (user) {
      const info = Chord.get(chord)
      addChordLookup(user.id, chord, info.aliases[0] ?? "", info.tonic ?? chord).catch(() => {})
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const chord = searchTerm.trim()
      setSelectedChord(chord)
      onChordSelect?.(chord)
      recordLookup(chord)

      const newRecent = [chord, ...recentSearches.filter((c) => c !== chord)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem("recentChordSearches", JSON.stringify(newRecent))

      setSearchTerm("")
      setActiveSection("fingering")
    }
  }

  const handleChordClick = (chord: string) => {
    setSelectedChord(chord)
    onChordSelect?.(chord)
    recordLookup(chord)

    const newRecent = [chord, ...recentSearches.filter((c) => c !== chord)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem("recentChordSearches", JSON.stringify(newRecent))
    setActiveSection("fingering")
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

  const toggleFavorite = async () => {
    if (!user || !chordData) {
      toast.error(t("msg.sign-in-to-save"))
      return
    }
    if (favoriteBusy) return

    const chordType = chordData.quality || "major"
    const rootNote = selectedChord.charAt(0)

    setFavoriteBusy(true)
    try {
      if (isFavorited) {
        await removeFavoriteChord(user.id, selectedChord)
        setIsFavorited(false)
        toast.success(t("msg.removed-from-favorites"))
      } else {
        await addFavoriteChord(user.id, selectedChord, chordType, rootNote)
        setIsFavorited(true)
        toast.success(t("msg.added-to-favorites"))
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    } finally {
      setFavoriteBusy(false)
    }
  }


  const getRelatedChords = (chordName: string) => {
    const root = chordName.charAt(0)
    const related: string[] = []

    // Add basic variations of the same root
    const variations = [`${root}`, `${root}m`, `${root}7`, `${root}maj7`]
    variations.forEach((chord) => {
      if (chord !== chordName && getChordData(chord, t)) {
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
        if (chord !== chordName && !related.includes(chord) && getChordData(chord, t)) {
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
          <NotePicker
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            placeholder={t("chord-finder.search-placeholder")}
          />


          {/* Examples */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm font-medium whitespace-nowrap shrink-0">{t("chord-finder.popular-chords")}:</span>
            <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible scrollbar-hide flex-nowrap sm:flex-wrap">
              {EXAMPLE_CHORDS.map((chord) => (
                <Button
                  key={chord}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChordClick(chord)}
                  className="text-xs shrink-0"
                >
                  {chord}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-sm font-medium whitespace-nowrap shrink-0">
                <Clock className="h-4 w-4" />
                {t("chord-finder.recent-searches")}
              </span>
              <Clock className="sm:hidden h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible scrollbar-hide flex-nowrap sm:flex-wrap">
                {recentSearches.map((chord) => (
                  <Button
                    key={chord}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleChordClick(chord)}
                    className="text-xs shrink-0"
                  >
                    {chord}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section tabs — mutually exclusive: only the active section's content renders below */}
      <div className="rounded-xl border border-[#e6dcd2] dark:border-slate-700 bg-[#fffdfa] dark:bg-slate-900 overflow-hidden">
        <div className="grid grid-cols-3">
          {(
            [
              { key: "fingering", label: t("variations.fingering-options") },
              { key: "theory", label: t("section.music-theory") },
              { key: "related", label: t("section.related-chords") },
            ] as const
          ).map((tab, i) => {
            const isActive = activeSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`px-4 py-3 text-sm text-center transition-colors ${
                  i < 2 ? "border-r border-[#e6dcd2] dark:border-slate-700" : ""
                } ${
                  isActive
                    ? "bg-[#f2e1d6] dark:bg-slate-800 text-[#bf6f4a] dark:text-orange-300 font-semibold"
                    : "bg-[#faf7f3] dark:bg-slate-900 text-[#37302a] dark:text-slate-200 font-medium hover:bg-[#f2e1d6]/40 dark:hover:bg-slate-800/60"
                }`}
              >
                <span className={isActive ? "inline-block border-b-2 border-[#bf6f4a] pb-0.5" : ""}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary Scale — shown alongside Fingering Options and Music Theory, hidden on Related Chords */}
      {activeSection !== "related" && tonalChordData.notes && tonalChordData.notes.length > 0 && (
        <ScaleDisplay
          analysis={analyzeChordScale(tonalChordData.notes, selectedChord)}
          chordName={selectedChord}
          showPrimary={true}
          showAlternatives={false}
        />
      )}

      {/* Fingering Options */}
      {activeSection === "fingering" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5" />
{chordData.name} - {t("variations.fingering-options")}
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  onClick={toggleFavorite}
                  disabled={favoriteBusy}
                  variant="outline"
                  size="sm"
                  className={`gap-2 transition-colors ${
                    isFavorited
                      ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                      : "text-gray-600 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">
                    {isFavorited ? t("chord-finder.remove-favorite") : t("chord-finder.add-favorite")}
                  </span>
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chordData.variations && chordData.variations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chordData.variations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Chord Diagram */}
                    <div className="flex justify-center sm:justify-start shrink-0">
                      <div className="bg-[#fbf4ef] dark:bg-slate-800 rounded p-2">
                        <ChordDiagram positions={variation.positions} startFret={variation.startFret} />
                      </div>
                    </div>

                    {/* Chord Info */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold text-base">{translateVariationName(variation.name, t)}</h3>
                        <Badge
                          variant={
                            variation.difficulty === "Beginner"
                              ? "default"
                              : variation.difficulty === "Intermediate"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {t(`chord.difficulty.${variation.difficulty.toLowerCase()}`)}
                        </Badge>
                      </div>

                      {(variation.description || variation.descriptionKey) && (
                        <p className="text-sm text-muted-foreground leading-snug">
                          {getTranslatedChordDescription(variation, t, selectedChord)}
                        </p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          onClick={() => handlePlayChord(variation.positions)}
                          disabled={isPlaying}
                          size="sm"
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
      )}

      {/* Music Theory & Analysis */}
      {activeSection === "theory" && (
      <>
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
                  <Badge key={index} variant="outline" className="bg-[#fbf4ef] dark:bg-slate-800 text-[#bf6f4a] dark:text-orange-300 border-[#e6dcd2] dark:border-slate-700">
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
                    <p className="font-medium">{chordData?.semitones?.join(", ") || tonalChordData.intervals?.join(", ") || "0, 4, 7"}</p>
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
              <div className="bg-[#fbf4ef] dark:bg-slate-800 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {getPlayingTips(selectedChord, chordData, t).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#bf6f4a] mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Scales */}
      {tonalChordData.notes && tonalChordData.notes.length > 0 && (
        <ScaleDisplay
          analysis={analyzeChordScale(tonalChordData.notes, selectedChord)}
          chordName={selectedChord}
          showPrimary={false}
          showAlternatives={true}
        />
      )}
      </>
      )}

      {/* Related Chords */}
      {activeSection === "related" && (
      <Card>
        <CardHeader>
          <CardTitle>{t("section.related-chords")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {getRelatedChords(selectedChord).map((relatedChord) => {
              const relatedData = getChordData(relatedChord, t)
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
      )}
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
