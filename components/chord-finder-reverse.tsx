"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { Music2, RotateCcw } from "lucide-react"

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

  const handleChordSelect = (chordName: string) => {
    onChordSelect?.(chordName)
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
              <div className="space-y-3">
                {possibleChords.map((chord, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleChordSelect(chord.name)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-lg">{chord.name}</h4>
                        <Badge
                          variant={
                            chord.confidence >= 90 ? "default" : chord.confidence >= 70 ? "secondary" : "outline"
                          }
                          className={
                            chord.confidence >= 90
                              ? "bg-green-600"
                              : chord.confidence >= 70
                                ? "bg-yellow-600"
                                : "bg-gray-600"
                          }
                        >
                          {chord.confidence}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{t("variations.notes")}: {chord.notes.join(", ")}</span>
                        <span className="text-xs text-muted-foreground">• {chord.type}</span>
                      </div>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          chord.confidence >= 90
                            ? "bg-green-600"
                            : chord.confidence >= 70
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                        }`}
                        style={{ width: `${chord.confidence}%` }}
                      />
                    </div>
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

// Chord detection algorithm
function findChordsFromNotes(selectedNotes: string[]): ChordMatch[] {
  const chordDatabase = [
    // Major chords
    { name: "C", notes: ["C", "E", "G"], type: "Major" },
    { name: "D", notes: ["D", "F#", "A"], type: "Major" },
    { name: "E", notes: ["E", "G#", "B"], type: "Major" },
    { name: "F", notes: ["F", "A", "C"], type: "Major" },
    { name: "G", notes: ["G", "B", "D"], type: "Major" },
    { name: "A", notes: ["A", "C#", "E"], type: "Major" },
    { name: "B", notes: ["B", "D#", "F#"], type: "Major" },

    // Minor chords
    { name: "Am", notes: ["A", "C", "E"], type: "Minor" },
    { name: "Bm", notes: ["B", "D", "F#"], type: "Minor" },
    { name: "Cm", notes: ["C", "Eb", "G"], type: "Minor" },
    { name: "Dm", notes: ["D", "F", "A"], type: "Minor" },
    { name: "Em", notes: ["E", "G", "B"], type: "Minor" },
    { name: "Fm", notes: ["F", "Ab", "C"], type: "Minor" },
    { name: "Gm", notes: ["G", "Bb", "D"], type: "Minor" },

    // 7th chords
    { name: "C7", notes: ["C", "E", "G", "Bb"], type: "Dominant 7th" },
    { name: "D7", notes: ["D", "F#", "A", "C"], type: "Dominant 7th" },
    { name: "E7", notes: ["E", "G#", "B", "D"], type: "Dominant 7th" },
    { name: "F7", notes: ["F", "A", "C", "Eb"], type: "Dominant 7th" },
    { name: "G7", notes: ["G", "B", "D", "F"], type: "Dominant 7th" },
    { name: "A7", notes: ["A", "C#", "E", "G"], type: "Dominant 7th" },
    { name: "B7", notes: ["B", "D#", "F#", "A"], type: "Dominant 7th" },

    // Major 7th chords
    { name: "Cmaj7", notes: ["C", "E", "G", "B"], type: "Major 7th" },
    { name: "Dmaj7", notes: ["D", "F#", "A", "C#"], type: "Major 7th" },
    { name: "Emaj7", notes: ["E", "G#", "B", "D#"], type: "Major 7th" },
    { name: "Fmaj7", notes: ["F", "A", "C", "E"], type: "Major 7th" },
    { name: "Gmaj7", notes: ["G", "B", "D", "F#"], type: "Major 7th" },
    { name: "Amaj7", notes: ["A", "C#", "E", "G#"], type: "Major 7th" },
    { name: "Bmaj7", notes: ["B", "D#", "F#", "A#"], type: "Major 7th" },

    // Minor 7th chords
    { name: "Am7", notes: ["A", "C", "E", "G"], type: "Minor 7th" },
    { name: "Bm7", notes: ["B", "D", "F#", "A"], type: "Minor 7th" },
    { name: "Cm7", notes: ["C", "Eb", "G", "Bb"], type: "Minor 7th" },
    { name: "Dm7", notes: ["D", "F", "A", "C"], type: "Minor 7th" },
    { name: "Em7", notes: ["E", "G", "B", "D"], type: "Minor 7th" },
    { name: "Fm7", notes: ["F", "Ab", "C", "Eb"], type: "Minor 7th" },
    { name: "Gm7", notes: ["G", "Bb", "D", "F"], type: "Minor 7th" },
  ]

  const matches: ChordMatch[] = []

  for (const chord of chordDatabase) {
    const confidence = calculateConfidence(selectedNotes, chord.notes)
    if (confidence >= 60) {
      matches.push({
        name: chord.name,
        confidence,
        notes: chord.notes,
        type: chord.type,
      })
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}

function calculateConfidence(selectedNotes: string[], chordNotes: string[]): number {
  // Normalize note names (convert flats to sharps for comparison)
  const normalizeNote = (note: string) => {
    const flatToSharp: { [key: string]: string } = {
      Db: "C#",
      Eb: "D#",
      Gb: "F#",
      Ab: "G#",
      Bb: "A#",
    }
    return flatToSharp[note] || note
  }

  const normalizedSelected = selectedNotes.map(normalizeNote)
  const normalizedChord = chordNotes.map(normalizeNote)

  // Count matches
  const matches = normalizedSelected.filter((note) => normalizedChord.includes(note)).length
  const totalChordNotes = normalizedChord.length
  const extraNotes = normalizedSelected.length - matches

  // Calculate confidence based on matches and penalties for extra notes
  let confidence = (matches / totalChordNotes) * 100

  // Penalty for extra notes that don't belong to the chord
  confidence -= extraNotes * 10

  // Bonus for complete chord
  if (matches === totalChordNotes && extraNotes === 0) {
    confidence = 100
  }

  return Math.max(0, Math.min(100, Math.round(confidence)))
}
