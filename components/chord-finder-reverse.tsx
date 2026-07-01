"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { Music2, RotateCcw, ChevronRight } from "lucide-react"
import { Chord } from "tonal"

interface ChordFinderReverseProps {
  onChordSelect?: (chord: string) => void
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

interface ChordMatch {
  name: string
  confidence: number
  notes: string[]
  type: string
}

export default function ChordFinderReverse({ onChordSelect }: ChordFinderReverseProps) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [possibleChords, setPossibleChords] = useState<ChordMatch[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    if (selectedNotes.length >= 2) {
      const chords = findChordsFromNotes(selectedNotes)
      setPossibleChords(chords)
    } else {
      setPossibleChords([])
    }
  }, [selectedNotes])

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) => (prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]))
  }

  const clearSelection = () => {
    setSelectedNotes([])
    setPossibleChords([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music2 className="h-5 w-5" />
              {t("variations.select-notes")}
            </div>
            <Button onClick={clearSelection} variant="outline" size="sm" className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              {t("ui.clear")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t("variations.click-notes-select")}:</h3>
            <div className="grid grid-cols-6 gap-2">
              {NOTES.map((note) => (
                <Button
                  key={note}
                  onClick={() => toggleNote(note)}
                  variant={selectedNotes.includes(note) ? "default" : "outline"}
                  className={`h-12 ${
                    selectedNotes.includes(note) ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-purple-50"
                  }`}
                >
                  {note}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Notes Display */}
          {selectedNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">{t("variations.selected-notes")}:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNotes.map((note) => (
                  <Badge key={note} variant="secondary" className="bg-purple-100">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Possible Chords */}
          {possibleChords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">{t("variations.possible-chords")}:</h3>
              <div className="space-y-2">
                {possibleChords.map((chord, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                    onClick={() => onChordSelect?.(chord.name)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-lg">{chord.name}</h4>
                        <Badge
                          variant={chord.confidence >= 90 ? "default" : chord.confidence >= 70 ? "secondary" : "outline"}
                          className={
                            chord.confidence >= 90
                              ? "bg-green-600"
                              : chord.confidence >= 70
                                ? "bg-yellow-600"
                                : "bg-gray-500"
                          }
                        >
                          {chord.confidence}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">{chord.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{chord.notes.join(" · ")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNotes.length >= 2 && possibleChords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("variations.no-matching-chords")}</p>
              <p className="text-sm mt-1">{t("variations.try-different-notes")}</p>
            </div>
          )}

          {selectedNotes.length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("variations.select-min-notes")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function findChordsFromNotes(selectedNotes: string[]): ChordMatch[] {
  // Use Tonal.js chord detection for comprehensive matching
  const detected = Chord.detect(selectedNotes)

  const matches: ChordMatch[] = detected.map((chordName) => {
    const chordData = Chord.get(chordName)
    const chordNotes = chordData.notes

    // Calculate how many selected notes are in the chord and vice versa
    const normalizedSelected = selectedNotes.map(normalizeNote)
    const normalizedChord = chordNotes.map(normalizeNote)
    const matchCount = normalizedSelected.filter((n) => normalizedChord.includes(n)).length
    const extraNotes = normalizedSelected.length - matchCount

    let confidence = Math.round((matchCount / Math.max(normalizedChord.length, 1)) * 100)
    confidence = Math.max(0, Math.min(100, confidence - extraNotes * 5))

    // Exact match bonus
    if (matchCount === normalizedChord.length && extraNotes === 0) confidence = 100

    return {
      name: chordName,
      confidence,
      notes: chordNotes,
      type: chordData.type || chordData.quality || "",
    }
  })

  // Also run partial matching against a broader set using note subsets
  const partialMatches = findPartialMatches(selectedNotes, detected)
  const allMatches = [...matches, ...partialMatches]

  // Deduplicate by name and sort by confidence
  const seen = new Set<string>()
  return allMatches
    .filter((m) => {
      if (seen.has(m.name)) return false
      seen.add(m.name)
      return m.confidence >= 50
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12)
}

function findPartialMatches(selectedNotes: string[], alreadyFound: string[]): ChordMatch[] {
  if (selectedNotes.length < 2) return []

  const results: ChordMatch[] = []
  const alreadyFoundSet = new Set(alreadyFound)

  // Try detecting chords from subsets of selected notes (ignore 1 note at a time)
  for (let i = 0; i < selectedNotes.length; i++) {
    const subset = selectedNotes.filter((_, idx) => idx !== i)
    if (subset.length < 2) continue

    const detected = Chord.detect(subset)
    for (const chordName of detected) {
      if (alreadyFoundSet.has(chordName)) continue
      alreadyFoundSet.add(chordName)

      const chordData = Chord.get(chordName)
      const normalizedSelected = selectedNotes.map(normalizeNote)
      const normalizedChord = chordData.notes.map(normalizeNote)
      const matchCount = normalizedSelected.filter((n) => normalizedChord.includes(n)).length
      const extraNotes = normalizedSelected.length - matchCount

      let confidence = Math.round((matchCount / Math.max(normalizedChord.length, 1)) * 100)
      confidence = Math.max(0, Math.min(100, confidence - extraNotes * 8))

      results.push({
        name: chordName,
        confidence,
        notes: chordData.notes,
        type: chordData.type || chordData.quality || "",
      })
    }
  }

  return results
}

function normalizeNote(note: string): string {
  const flatToSharp: Record<string, string> = {
    Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
  }
  return flatToSharp[note] || note
}
