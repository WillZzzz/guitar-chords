"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Music, Clock, Play, Volume2, Heart } from "lucide-react"
import { getChordData } from "@/lib/chord-utils"
import { playChordFromPositionsSmart, stopAllAudio } from "@/lib/audio-utils-hybrid"
import { useAuth } from "@/contexts/auth-context"
import { addFavoriteChord, removeFavoriteChord, isChordFavorite } from "@/lib/local-storage"
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
      toast.error("Please sign in to save favorites")
      return
    }

    const chordType = chordData.type || "major"
    const rootNote = selectedChord.charAt(0)

    if (isFavorited) {
      removeFavoriteChord(user.id, selectedChord, chordType)
      setIsFavorited(false)
      toast.success("Removed from favorites")
    } else {
      addFavoriteChord(user.id, selectedChord, chordType, rootNote)
      setIsFavorited(true)
      toast.success("Added to favorites")
    }
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
          <p>Chord not found. Try searching for a different chord.</p>
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
            Search Chords
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter chord name (e.g., Am, C7, Fmaj7)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              Search
            </Button>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-sm font-medium mb-2">Examples:</h4>
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
                Recent Searches:
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
              {chordData.name} - Fingering Options
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

                      {variation.description && (
                        <p className="text-sm text-muted-foreground">{variation.description}</p>
                      )}

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handlePlayChord(variation.positions)}
                          disabled={isPlaying}
                          className="gap-2"
                        >
                          {isPlaying ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
                          {isPlaying ? "Playing..." : "Play"}
                        </Button>

                        {variation.startFret && variation.startFret > 1 && (
                          <span className="text-sm text-muted-foreground">Starting fret: {variation.startFret}</span>
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
          <CardTitle>Music Theory & Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information using Tonal.js */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Chord Notes</h4>
              <div className="flex flex-wrap gap-2">
                {tonalChordData.notes?.map((note: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {note}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These are the individual notes that make up the {tonalChordData.name || selectedChord} chord.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Interval Formula</h4>
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
              <h4 className="font-medium mb-3">Chord Analysis</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    Type
                  </Badge>
                  <div>
                    <p className="font-medium">{tonalChordData.quality || "Unknown"} Chord</p>
                    <p className="text-sm text-muted-foreground">
                      {getDetailedChordDescription(tonalChordData.quality || "major", selectedChord)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    Semitones
                  </Badge>
                  <div>
                    <p className="font-medium">{tonalChordData.semitones?.join(", ") || "0, 4, 7"}</p>
                    <p className="text-sm text-muted-foreground">
                      Semitone distances from the root note to each chord tone.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    Function
                  </Badge>
                  <div>
                    <p className="font-medium">{getChordFunction(selectedChord)}</p>
                    <p className="text-sm text-muted-foreground">{getChordFunctionDescription(selectedChord)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Progressions */}
            <div>
              <h4 className="font-medium mb-3">Common Progressions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCommonProgressions(selectedChord).map((progression, index) => (
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
              <h4 className="font-medium mb-3">Playing Tips</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {getPlayingTips(selectedChord, chordData).map((tip, index) => (
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
          <CardTitle>Related Chords</CardTitle>
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
function getDetailedChordDescription(quality: string, chordName: string): string {
  const root = chordName.charAt(0)
  const descriptions: { [key: string]: string } = {
    Major: `A major chord built on ${root}, containing a major third (4 semitones) and perfect fifth (7 semitones). Creates a bright, stable, and happy sound that forms the foundation of Western harmony.`,
    Minor: `A minor chord built on ${root}, containing a minor third (3 semitones) and perfect fifth (7 semitones). The flattened third gives it a darker, more melancholic character compared to major chords.`,
    "Dominant 7th": `A major triad with an added minor seventh (10 semitones from root). This creates harmonic tension that naturally wants to resolve, making it essential in blues, jazz, and classical harmony.`,
    "Major 7th": `A major triad with an added major seventh (11 semitones from root). Creates a dreamy, sophisticated sound popular in jazz and contemporary music. Less tense than dominant 7th chords.`,
    "Minor 7th": `A minor triad with an added minor seventh. Commonly used in jazz, R&B, and funk, it's less sad than a plain minor chord and adds harmonic richness without strong tension.`,
    Suspended: `Replaces the third with either a second (sus2) or fourth (sus4), creating an open, unresolved sound that neither major nor minor. Often resolves back to the major or minor version.`,
    Diminished: `Built entirely of minor thirds (3 semitones each), creating maximum harmonic tension. Often used as passing chords or to create dramatic, unstable moments in music.`,
    Augmented: `Contains a major third and augmented fifth (8 semitones), creating a mysterious, floating quality. The augmented fifth creates harmonic ambiguity and is popular in impressionist music.`,
  }
  return (
    descriptions[quality] ||
    `A ${quality.toLowerCase()} chord with unique harmonic properties that adds color and character to musical progressions.`
  )
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

function getChordFunctionDescription(chordName: string): string {
  const func = getChordFunction(chordName)
  const descriptions: { [key: string]: string } = {
    "Tonic (I)": "The home chord that provides stability and resolution. Songs often start and end on this chord.",
    "Subdominant (IV)":
      "Creates a sense of departure from home, often leading to the dominant. Provides harmonic contrast.",
    "Dominant (V)": "Creates tension that wants to resolve back to the tonic. Essential for establishing key centers.",
    "Variable Function": "Can serve different harmonic functions depending on the musical context and key.",
  }
  return descriptions[func] || "Serves various harmonic functions in different musical contexts."
}

function getCommonProgressions(chordName: string): Array<{ name: string; chords: string[]; description: string }> {
  const root = chordName.charAt(0)
  const progressions: { [key: string]: Array<{ name: string; chords: string[]; description: string }> } = {
    C: [
      {
        name: "I-V-vi-IV",
        chords: ["C", "G", "Am", "F"],
        description: "The most popular progression in Western music",
      },
      { name: "ii-V-I", chords: ["Dm", "G", "C"], description: "Essential jazz progression" },
    ],
    G: [
      { name: "I-V-vi-IV", chords: ["G", "D", "Em", "C"], description: "Classic rock and pop progression" },
      { name: "I-vi-ii-V", chords: ["G", "Em", "Am", "D"], description: "Circle of fifths progression" },
    ],
    Am: [
      { name: "i-VII-VI-VII", chords: ["Am", "G", "F", "G"], description: "Natural minor progression" },
      { name: "i-iv-V-i", chords: ["Am", "Dm", "E", "Am"], description: "Harmonic minor progression" },
    ],
    F: [
      { name: "I-V-vi-IV", chords: ["F", "C", "Dm", "Bb"], description: "Popular in folk and country" },
      { name: "I-vi-IV-V", chords: ["F", "Dm", "Bb", "C"], description: "50s progression" },
    ],
  }
  return (
    progressions[root] || [
      { name: "Basic Triad", chords: [chordName], description: "Use as part of standard progressions" },
    ]
  )
}

function getPlayingTips(chordName: string, chordData: any): string[] {
  const tips = []

  // General tips based on chord type
  if (chordName.includes("F") && !chordName.includes("#")) {
    tips.push(
      "F chords often require barre technique - practice pressing firmly across all strings with your index finger",
    )
  }

  if (chordName.includes("B") && !chordName.includes("b")) {
    tips.push("B major is challenging for beginners - try the easier version higher up the neck first")
  }

  if (chordName.includes("7")) {
    tips.push("7th chords add harmonic richness - practice transitioning smoothly to and from basic triads")
  }

  if (chordName.includes("m") && !chordName.includes("maj")) {
    tips.push(
      "Minor chords often feel more comfortable when you arch your fingers well to avoid muting adjacent strings",
    )
  }

  // Add difficulty-based tips
  if (chordData.variations && chordData.variations[0]?.difficulty === "Beginner") {
    tips.push("This is a great chord for beginners - focus on clean finger placement and avoid touching other strings")
  }

  if (chordData.variations && chordData.variations.some((v: any) => v.difficulty === "Advanced")) {
    tips.push("Advanced variations available - master the basic form first before attempting more complex fingerings")
  }

  // Universal tips
  tips.push("Practice chord changes slowly at first, focusing on accuracy over speed")
  tips.push("Make sure each string rings clearly by pressing firmly just behind the frets")

  return tips.slice(0, 4) // Limit to 4 tips to avoid overwhelming
}
