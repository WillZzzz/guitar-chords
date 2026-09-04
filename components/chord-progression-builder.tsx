"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { saveProgression, updateProgression, addProgressionLookup, type EditableProgression } from "@/lib/user-data"
import { playChordFromPositionsSmart } from "@/lib/audio-utils-hybrid"
import { getChordData } from "@/lib/chord-utils"
import { Chord, Key, Interval, Note } from "tonal"
import { Plus, X, Save, GripVertical, ListMusic, Play, Volume2, Music, Share2, ChevronUp, ChevronDown, Minus, Square, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import MiniChordDiagram from "@/components/mini-chord-diagram"

const ALL_KEYS = ["C", "G", "D", "A", "E", "B", "F#", "F", "Bb", "Eb", "Ab", "Db"]

const KEY_SEMITONES: Record<string, number> = {
  C: 0, G: 7, D: 2, A: 9, E: 4, B: 11, "F#": 6,
  F: 5, Bb: 10, Eb: 3, Ab: 8, Db: 1,
}

function transposeChords(chords: string[], semitones: number): string[] {
  if (semitones === 0) return chords
  return chords.map((chord) => {
    const transposed = Chord.transpose(chord, Interval.fromSemitones(semitones))
    return transposed ? normalizeChordName(transposed) : chord
  })
}

const ALL_COMMON_CHORDS = [
  "C", "G", "Am", "F", "D", "Em", "A", "E",
  "Dm", "B7", "Cmaj7", "Gmaj7", "Am7", "Fmaj7", "D7", "Em7", "A7", "E7",
]

// Roman numerals for major and natural minor modes
const ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
const ROMAN_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"]

const COMMON_PROGRESSIONS = [
  { name: "I-V-vi-IV",    displayKey: "progression-desc.i-v-vi-iv",    chords: ["C", "G", "Am", "F"] },
  { name: "vi-IV-I-V",    displayKey: "progression-desc.classic-rock",  chords: ["Am", "F", "C", "G"] },
  { name: "I-vi-IV-V",    displayKey: "progression-desc.fifties",       chords: ["C", "Am", "F", "G"] },
  { name: "I-IV-V",       displayKey: null,                              chords: ["C", "F", "G"],        displayName: "Basic blues/rock" },
  { name: "ii-V-I",       displayKey: "progression-desc.ii-v-i",        chords: ["Dm", "G", "C"] },
  { name: "i-VII-VI-VII", displayKey: null,                              chords: ["Am", "G", "F", "E"],  displayName: "Andalusian cadence" },
  { name: "I-V-vi-iii-IV",displayKey: null,                              chords: ["C", "G", "Am", "Em", "F"], displayName: "Axis / Let It Be" },
  { name: "vi-ii-V-I",    displayKey: null,                              chords: ["Am7", "Dm7", "G7", "Cmaj7"], displayName: "Jazz turnaround" },
  { name: "I-II-IV-I",    displayKey: null,                              chords: ["C", "D", "F", "C"],   displayName: "Neo soul" },
  { name: "12-Bar Blues",  displayKey: "progression-desc.12-bar-blues",  chords: ["C","C","C","C","F","F","C","C","G","F","C","G"] },
]

interface ChordMatch {
  name: string
  confidence: number
  notes: string[]
  type: string
}

function detectChordsFromNotes(selectedNotes: string[]): ChordMatch[] {
  if (selectedNotes.length < 2) return []
  return Chord.detect(selectedNotes).map((chordName) => {
    const data = Chord.get(chordName)
    const matchCount = selectedNotes.filter((n) => data.notes.includes(n)).length
    const confidence = Math.min(100, Math.round((matchCount / Math.max(data.notes.length, 1)) * 100))
    return { name: chordName, notes: data.notes, confidence, type: data.type || data.quality || "" }
  }).sort((a, b) => b.confidence - a.confidence).slice(0, 6)
}

// Normalize transposed chord name to avoid double-flats/double-sharps
function normalizeChordName(chordName: string): string {
  const info = Chord.get(chordName)
  if (!info.tonic || info.empty) return chordName
  const simpleTonic = Note.simplify(info.tonic) || info.tonic
  const suffix = info.symbol.slice(info.tonic.length)
  return simpleTonic + suffix
}

// Validate a chord name — Tonal can parse it and getChordData knows it
function isValidChord(name: string): boolean {
  return !Chord.get(name).empty
}

interface ChordProgressionBuilderProps {
  onChordSelect?: (chord: string) => void
  externalProgression?: string[]
  onExternalProgressionConsumed?: () => void
  editingProgression?: EditableProgression
  onEditingProgressionConsumed?: () => void
}

export default function ChordProgressionBuilder({
  onChordSelect,
  externalProgression,
  onExternalProgressionConsumed,
  editingProgression,
  onEditingProgressionConsumed,
}: ChordProgressionBuilderProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [progression, setProgression] = useState<string[]>([])
  const [progressionName, setProgressionName] = useState("")
  const [progressionDescription, setProgressionDescription] = useState("")
  const [tags, setTags] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCommonProgressions, setShowCommonProgressions] = useState(false)
  const [playingChord, setPlayingChord] = useState<string | null>(null)
  const [playingProgression, setPlayingProgression] = useState(false)
  const [customChord, setCustomChord] = useState("")
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [bpm, setBpm] = useState(80)
  const [selectedKey, setSelectedKey] = useState("C")
  const [keyMode, setKeyMode] = useState<"major" | "minor">("major")
  const [showFingering, setShowFingering] = useState(true)
  const [altFingering, setAltFingering] = useState<Record<string, number>>({})
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const stopRef = useRef(false)

  // Drives the "Your Progression" chip list orientation — @hello-pangea/dnd's
  // Droppable direction is a JS prop, not CSS, so it can't follow a Tailwind
  // breakpoint on its own; this mirrors Tailwind's default `sm` cutoff (640px).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobileLayout(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Load and validate progression from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const p = params.get("p")
    if (p) {
      const valid = p.split(",").filter((c) => c && isValidChord(c))
      if (valid.length > 0) setProgression(valid)
    }
  }, [])

  // Load progression injected from the library panel
  useEffect(() => {
    if (externalProgression && externalProgression.length > 0) {
      setProgression(externalProgression)
      onExternalProgressionConsumed?.()
    }
  }, [externalProgression])

  // Load a saved progression for in-place editing
  useEffect(() => {
    if (!editingProgression) return
    setProgression(editingProgression.chords)
    setProgressionName(editingProgression.name)
    setProgressionDescription(editingProgression.description ?? "")
    setTags((editingProgression.tags ?? []).join(", "))
    setEditingId(editingProgression.id)
    onEditingProgressionConsumed?.()
  }, [editingProgression])

  const cancelEdit = () => {
    setEditingId(null)
    setProgressionName("")
    setProgressionDescription("")
    setTags("")
  }

  // Diatonic chords for selected key — memoized
  const diatonicChords = useMemo(() => {
    if (!selectedKey) return ALL_COMMON_CHORDS
    return keyMode === "major"
      ? Key.majorKey(selectedKey).triads
      : Key.minorKey(selectedKey).natural.triads
  }, [selectedKey, keyMode])

  const romanNumerals = keyMode === "major" ? ROMAN_MAJOR : ROMAN_MINOR

  const addChord = (chord: string) => setProgression((prev) => [...prev, chord])
  const removeChord = (index: number) => setProgression((prev) => prev.filter((_, i) => i !== index))
  const clearProgression = () => setProgression([])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(progression)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    setProgression(items)
  }

  const transposeProgression = (semitones: number) => {
    if (progression.length === 0) return
    setProgression((prev) =>
      prev.map((chord) => {
        const transposed = Chord.transpose(chord, Interval.fromSemitones(semitones))
        return transposed ? normalizeChordName(transposed) : chord
      })
    )
  }

  // Treats the first chord's root as the progression's current key and shifts
  // by whatever semitone distance gets it to the picked key.
  const transposeToKey = (targetRoot: string) => {
    if (progression.length === 0) return
    const currentTonic = Chord.get(progression[0]).tonic
    if (!currentTonic) return
    const currentPitch = Note.chroma(currentTonic)
    const targetPitch = Note.chroma(targetRoot)
    if (currentPitch == null || targetPitch == null) return
    const diff = (targetPitch - currentPitch + 12) % 12
    if (diff === 0) return
    transposeProgression(diff)
  }

  const currentProgressionKey = useMemo(() => {
    if (progression.length === 0) return null
    return Chord.get(progression[0]).tonic ?? null
  }, [progression])

  const handleAddCustomChord = () => {
    const chord = customChord.trim()
    if (!chord) return
    const chordData = getChordData(chord)
    if (chordData) {
      addChord(chord)
      setCustomChord("")
      toast.success(t("progression-builder.toast-added").replace("{chord}", chord))
    } else {
      toast.error(t("progression-builder.toast-chord-not-recognized").replace("{chord}", chord))
    }
  }

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) => (prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]))
  }

  // Shared by both the inline (mobile) and standalone (desktop) fingering displays
  const getFingeringInfo = (chord: string, idx: number) => {
    const chordData = getChordData(chord)
    const varIndex = altFingering[`${chord}-${idx}`] ?? 0
    const variation = chordData?.variations?.[varIndex]
    const hasAlt = chordData?.variations && chordData.variations.length > 1
    return { chordData, variation, hasAlt }
  }

  const playChord = async (chordName: string) => {
    if (playingProgression || playingChord === chordName) return
    setPlayingChord(chordName)
    try {
      const chordData = getChordData(chordName)
      const rootNote = Chord.get(chordName).tonic ?? chordName.charAt(0)
      if (chordData?.variations?.length) {
        await playChordFromPositionsSmart(chordData.variations[0].positions, rootNote)
      } else {
        toast.error(t("progression-builder.toast-fingering-unavailable"))
      }
    } catch {
      toast.error(t("progression-builder.toast-audio-failed"))
    }
    setTimeout(() => setPlayingChord((cur) => (cur === chordName ? null : cur)), 2000)
  }

  const playProgressionAll = async () => {
    if (playingProgression || progression.length === 0) return
    stopRef.current = false
    setPlayingProgression(true)
    const beatMs = Math.round((60000 / bpm) * 2)
    try {
      for (let i = 0; i < progression.length; i++) {
        if (stopRef.current) break
        const chordName = progression[i]
        setPlayingChord(chordName)
        const chordData = getChordData(chordName)
        const rootNote = Chord.get(chordName).tonic ?? chordName.charAt(0)
        if (chordData?.variations?.length) {
          await playChordFromPositionsSmart(chordData.variations[0].positions, rootNote)
        }
        if (i < progression.length - 1 && !stopRef.current) {
          await new Promise((resolve) => setTimeout(resolve, beatMs))
        }
      }
    } catch {
      toast.error(t("progression-builder.toast-progression-failed"))
    }
    setPlayingChord(null)
    setPlayingProgression(false)
  }

  const stopProgression = () => {
    stopRef.current = true
    setPlayingProgression(false)
    setPlayingChord(null)
  }

  const saveCurrentProgression = async () => {
    if (!progressionName.trim()) {
      toast.error(t("progression-builder.toast-name-required"))
      return
    }
    if (progression.length === 0) {
      toast.error(t("progression-builder.toast-chords-required"))
      return
    }
    if (!user) {
      toast.error(t("progression-builder.toast-sign-in-required"))
      return
    }
    const tagArray = tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    const name = progressionName.trim()
    const description = progressionDescription.trim() || undefined
    const tagsOrUndef = tagArray.length > 0 ? tagArray : undefined
    try {
      if (editingId) {
        await updateProgression(user.id, editingId, name, progression, description, tagsOrUndef)
        addProgressionLookup(user.id, editingId, name, progression).catch(() => {})
        toast.success(t("progression-builder.toast-updated"))
        // stay in edit mode — repeated tweaks keep updating the same row until cancelled
      } else {
        const saved = await saveProgression(user.id, name, progression, description, tagsOrUndef)
        addProgressionLookup(user.id, saved.id, name, progression).catch(() => {})
        toast.success(t("progression-builder.toast-saved"))
        setProgressionName("")
        setProgressionDescription("")
        setTags("")
      }
    } catch {
      toast.error(t("msg.error-unexpected"))
    }
  }

  const shareProgression = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("p", progression.join(","))
    navigator.clipboard.writeText(url.toString())
      .then(() => toast.success(t("progression-builder.share-copied")))
      .catch(() => toast.error(t("progression-builder.share-failed")))
  }

  const detectedChords = useMemo(() => detectChordsFromNotes(selectedNotes), [selectedNotes])

  return (
    <div className="space-y-6">
      {/* Add Chords Card */}
      <Card className="chord-card">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            {t("progression-builder.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("progression-builder.description")}</p>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6 pt-0">

          {/* Key Filter */}
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">1</span>
              <span className="text-sm font-semibold">{t("progression-builder.key-filter")}</span>
              <Button
                variant={selectedKey === "" ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs ml-auto"
                onClick={() => setSelectedKey("")}
              >
                {t("progression-builder.all-keys")}
              </Button>
              {selectedKey !== "" && (
                <>
                  <Button
                    variant={keyMode === "major" ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setKeyMode("major")}
                  >
                    {t("progression-builder.major-mode")}
                  </Button>
                  <Button
                    variant={keyMode === "minor" ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setKeyMode("minor")}
                  >
                    {t("progression-builder.minor-mode")}
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_KEYS.map((key) => (
                <Button
                  key={key}
                  variant={selectedKey === key ? "default" : "outline"}
                  size="sm"
                  className={`h-8 px-2 sm:px-3 text-sm font-semibold ${selectedKey === key ? "bg-blue-600 hover:bg-blue-700" : "bg-white dark:bg-transparent"}`}
                  onClick={() => setSelectedKey(selectedKey === key ? "" : key)}
                >
                  {key}
                </Button>
              ))}
            </div>
            {selectedKey && (
              <p className="text-xs text-muted-foreground mt-2">
                {t("progression-builder.diatonic-chords")
                  .replace("{key}", selectedKey)
                  .replace("{mode}", keyMode === "major" ? t("progression-builder.major-mode") : t("progression-builder.minor-mode"))}
              </p>
            )}
          </div>

          {/* Chord Buttons */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("progression-builder.add-chords")}</h3>
            <div className={`grid gap-2 ${selectedKey ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"}`}>
              {diatonicChords.map((chord, i) => (
                <Button
                  key={`${chord}-${i}`}
                  variant="outline"
                  size="sm"
                  onClick={() => addChord(chord)}
                  className="h-10 text-sm transition-all hover:bg-blue-50 hover:border-blue-300"
                >
                  {selectedKey && (
                    <span className="text-[10px] text-muted-foreground mr-1">{romanNumerals[i]}</span>
                  )}
                  <Plus className="h-3 w-3 mr-1 shrink-0" />
                  {chord}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Chord Input */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border">
            <h4 className="text-sm font-medium mb-3">{t("progression-builder.add-custom-chord")}</h4>
            <Tabs defaultValue="name" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="name">{t("progression-builder.by-name")}</TabsTrigger>
                <TabsTrigger value="notes">{t("progression-builder.by-notes")}</TabsTrigger>
              </TabsList>

              <TabsContent value="name" className="space-y-3 mt-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Cmaj7, F#m, Bb9..."
                    value={customChord}
                    onChange={(e) => setCustomChord(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomChord() }}
                    className="flex-1 min-w-0"
                  />
                  <Button variant="outline" onClick={handleAddCustomChord} disabled={!customChord.trim()} className="gap-1 shrink-0">
                    <Plus className="h-4 w-4" />
                    {t("ui.add")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("progression-builder.chord-name-examples")}</p>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-3">
                <p className="text-sm text-muted-foreground">{t("progression-builder.select-notes-instruction")}</p>
                <div className="grid grid-cols-6 gap-2">
                  {["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map((note) => (
                    <Button
                      key={note}
                      variant={selectedNotes.includes(note) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNote(note)}
                      className={`h-10 text-sm font-semibold ${
                        selectedNotes.includes(note)
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "hover:bg-green-50 hover:border-green-300"
                      }`}
                    >
                      {note}
                    </Button>
                  ))}
                </div>

                {selectedNotes.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{t("progression-builder.selected-notes")}</span>
                    {selectedNotes.map((n) => (
                      <Badge key={n} variant="secondary" className="bg-green-100 text-green-800">{n}</Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedNotes([])} className="h-6 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />{t("ui.clear")}
                    </Button>
                  </div>
                )}

                {selectedNotes.length >= 2 && detectedChords.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">{t("progression-builder.possible-chords")} ({detectedChords.length})</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detectedChords.map((chord, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="justify-between h-auto p-3 text-left hover:bg-green-50 hover:border-green-300"
                          onClick={() => {
                            addChord(chord.name)
                            toast.success(t("progression-builder.toast-added").replace("{chord}", chord.name))
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{chord.name}</span>
                            <span className="text-xs text-muted-foreground">{chord.notes.join(" · ")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs text-white ${chord.confidence >= 90 ? "bg-green-600" : chord.confidence >= 70 ? "bg-yellow-600" : "bg-gray-500"}`}>
                              {chord.confidence}%
                            </Badge>
                            <Plus className="h-3 w-3" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNotes.length >= 2 && detectedChords.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground bg-white dark:bg-slate-900 rounded-lg border">
                    <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{t("progression-builder.no-chords-found")}</p>
                  </div>
                )}

                {selectedNotes.length < 2 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{selectedNotes.length === 1 ? t("progression-builder.select-one-more") : t("progression-builder.select-notes-to-build")}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Common Progressions */}
          <Collapsible open={showCommonProgressions} onOpenChange={setShowCommonProgressions}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold mb-3 hover:text-foreground/80">
              {showCommonProgressions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {t("progression-builder.common-progressions")}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {COMMON_PROGRESSIONS.map((prog, index) => {
                  const semitones = KEY_SEMITONES[selectedKey] ?? 0
                  const chords = transposeChords(prog.chords, semitones)
                  return (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                      onClick={() => setProgression(chords)}
                    >
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm mb-1">{prog.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {prog.displayKey ? t(prog.displayKey) : prog.displayName}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {chords.slice(0, 8).map((chord, ci) => (
                            <Badge key={ci} variant="outline" className="text-xs">{chord}</Badge>
                          ))}
                          {chords.length > 8 && <Badge variant="outline" className="text-xs">+{chords.length - 8}</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Your Progression Card — deliberately NOT using the shared "chord-card" class:
          its :hover rule applies a CSS transform, which becomes the positioning
          reference for the drag-and-drop library's position:fixed dragged item
          (since hovering this card is unavoidable while dragging inside it),
          causing the dragged chord block to jump to the wrong place on screen. */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{t("progression-builder.your-progression")}</span>
            <div className="flex flex-wrap items-center gap-2">
              {/* BPM Control */}
              <div className="flex items-center gap-1 border rounded-md px-2 py-1">
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                  onClick={() => setBpm((b) => Math.max(40, b - 5))}
                  disabled={bpm <= 40}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-mono w-8 text-center">{bpm}</span>
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                  onClick={() => setBpm((b) => Math.min(200, b + 5))}
                  disabled={bpm >= 200}
                >
                  <Plus className="h-3 w-3" />
                </button>
                <span className="text-xs text-muted-foreground ml-1">{t("progression-builder.bpm")}</span>
              </div>

              {/* Transpose */}
              {progression.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      {t("progression-builder.transpose")}
                      {currentProgressionKey && (
                        <span className="text-muted-foreground">({currentProgressionKey})</span>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {ALL_KEYS.map((key) => {
                      const isCurrent =
                        currentProgressionKey != null && Note.chroma(key) === Note.chroma(currentProgressionKey)
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => transposeToKey(key)}
                          className={isCurrent ? "font-semibold bg-accent" : ""}
                        >
                          {key}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Play / Stop / Share / Clear */}
              {progression.length > 0 && (
                <>
                  {playingProgression ? (
                    <Button variant="outline" size="sm" onClick={stopProgression} className="gap-1">
                      <Square className="h-4 w-4" /><span className="hidden sm:inline">Stop</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={playProgressionAll} className="gap-1">
                      <Play className="h-4 w-4" /><span className="hidden sm:inline">{t("progression-builder.play-all")}</span>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={shareProgression} className="gap-1">
                    <Share2 className="h-4 w-4" /><span className="hidden sm:inline">{t("progression-builder.share-link")}</span>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={clearProgression}>
                {t("ui.clear")}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
          {/* Fingering reference toggle — shared control, sits above the chord list on both platforms */}
          {progression.length > 0 && (
            <button
              onClick={() => setShowFingering((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showFingering ? "rotate-180" : ""}`} />
              {showFingering ? "Hide" : "Show"} fingering reference
            </button>
          )}

          {/* Unique chord links row */}
          {progression.length > 0 && (() => {
            const unique = Array.from(new Set(progression))
            return (
              <div className="flex flex-wrap gap-1 pb-1 border-b">
                <span className="text-xs text-muted-foreground self-center mr-1">Chords:</span>
                {unique.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => onChordSelect?.(chord)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800 transition-colors"
                  >
                    {chord}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            )
          })()}

          {progression.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListMusic className="mx-auto h-12 w-12 mb-4" />
              <p>{t("progression-builder.no-chords-yet")}</p>
            </div>
          ) : (
            <div className="flex gap-2 items-start">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="progression" direction={isMobileLayout ? "vertical" : "horizontal"}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-1 min-w-0 gap-1.5 sm:gap-2 min-h-[60px] p-3 sm:p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg scrollbar-hide ${
                        isMobileLayout ? "flex-col items-start" : "flex-row flex-nowrap overflow-x-auto"
                      }`}
                    >
                      {progression.map((chord, index) => (
                        <Draggable key={`${chord}-${index}`} draggableId={`${chord}-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center shrink-0 ${isMobileLayout && showFingering ? "min-h-[156px]" : ""} ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                            >
                              <div
                                className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-all shrink-0 ${
                                  playingChord === chord
                                    ? "bg-blue-600 text-white shadow-lg animate-pulse"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </div>
                                <span className="font-semibold text-sm sm:text-base">{chord}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => playChord(chord)}
                                  disabled={playingChord === chord}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-primary-foreground/20"
                                >
                                  {playingChord === chord ? <Volume2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse" /> : <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeChord(index)}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-primary-foreground/20"
                                >
                                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Fingering diagrams — mobile only, deliberately outside the dashed chord box, one column beside it.
                  Each row reserves the same min-height as the chip rows above so the two columns stay aligned. */}
              {isMobileLayout && showFingering && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  {progression.map((chord, idx) => {
                    const { chordData, variation, hasAlt } = getFingeringInfo(chord, idx)
                    return (
                      <div key={`${chord}-${idx}-fingering`} className="min-h-[156px] flex flex-col items-center justify-center gap-0.5">
                        {variation ? (
                          <MiniChordDiagram positions={variation.positions} startFret={variation.startFret} />
                        ) : (
                          <div className="w-16 h-20 border rounded flex items-center justify-center text-xs text-muted-foreground text-center px-1">
                            No data
                          </div>
                        )}
                        {hasAlt && (
                          <button
                            onClick={() =>
                              setAltFingering((prev) => {
                                const key = `${chord}-${idx}`
                                const next = ((prev[key] ?? 0) + 1) % (chordData!.variations!.length)
                                return { ...prev, [key]: next }
                              })
                            }
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            alt {(altFingering[`${chord}-${idx}`] ?? 0) + 1}/{chordData!.variations!.length}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Fingering Reference — desktop only; mobile shows this beside the chord box above */}
          {progression.length > 0 && (
            <div>
              {showFingering && !isMobileLayout && (
                <div className="flex gap-4 overflow-x-auto pt-3 pb-1 scrollbar-hide">
                  {progression.map((chord, idx) => {
                    const { chordData, variation, hasAlt } = getFingeringInfo(chord, idx)
                    return (
                      <div key={`${chord}-${idx}`} className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          onClick={() => onChordSelect?.(chord)}
                          className="text-xs font-semibold text-orange-700 hover:underline"
                        >
                          {chord}
                        </button>
                        {variation ? (
                          <MiniChordDiagram
                            positions={variation.positions}
                            startFret={variation.startFret}
                          />
                        ) : (
                          <div className="w-16 h-20 border rounded flex items-center justify-center text-xs text-muted-foreground text-center px-1">
                            No data
                          </div>
                        )}
                        {hasAlt && (
                          <button
                            onClick={() =>
                              setAltFingering((prev) => {
                                const key = `${chord}-${idx}`
                                const next = ((prev[key] ?? 0) + 1) % (chordData!.variations!.length)
                                return { ...prev, [key]: next }
                              })
                            }
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            alt {(altFingering[`${chord}-${idx}`] ?? 0) + 1}/{chordData!.variations!.length}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Card */}
      {progression.length > 0 && (
        <Card className="chord-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t("progression-builder.save-progression")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            {editingId && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-sm">
                <span className="text-orange-800">
                  {t("progression-builder.editing-banner").replace("{name}", progressionName)}
                </span>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  {t("progression-builder.cancel-edit")}
                </Button>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">{t("progression-builder.name-required")}</label>
              <Input
                placeholder={t("progression-builder.name-placeholder")}
                value={progressionName}
                onChange={(e) => setProgressionName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("progression-builder.description-optional")}</label>
              <Textarea
                placeholder={t("progression-builder.description-placeholder")}
                value={progressionDescription}
                onChange={(e) => setProgressionDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("progression-builder.tags")}</label>
              <Input
                placeholder={t("progression-builder.tags-placeholder")}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <Button onClick={saveCurrentProgression} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {editingId ? t("progression-builder.update-button") : t("progression-builder.save-button")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
