"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useAuth } from "@/contexts/auth-context"
import { saveProgression } from "@/lib/local-storage"
import { playChordFromPositions } from "@/lib/audio-utils"
import { getChordData, identifyChordFromNotes } from "@/lib/chord-utils"
import { Plus, X, Save, GripVertical, ListMusic, Play, Volume2, Music } from "lucide-react"
import { toast } from "sonner"

const commonChords = [
  "C",
  "G",
  "Am",
  "F",
  "D",
  "Em",
  "A",
  "E",
  "Dm",
  "B7",
  "Cmaj7",
  "Gmaj7",
  "Am7",
  "Fmaj7",
  "D7",
  "Em7",
  "A7",
  "E7",
]

const commonProgressions = [
  { name: "I-V-vi-IV", chords: ["C", "G", "Am", "F"] },
  { name: "vi-IV-I-V", chords: ["Am", "F", "C", "G"] },
  { name: "I-vi-IV-V", chords: ["C", "Am", "F", "G"] },
  { name: "ii-V-I", chords: ["Dm", "G", "C"] },
  { name: "12-Bar Blues", chords: ["C", "C", "C", "C", "F", "F", "C", "C", "G", "F", "C", "G"] },
]

// All chromatic notes
const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export default function ChordProgressionBuilder() {
  const { user } = useAuth()
  const [progression, setProgression] = useState<string[]>([])
  const [progressionName, setProgressionName] = useState("")
  const [progressionDescription, setProgressionDescription] = useState("")
  const [tags, setTags] = useState("")
  const [playingChord, setPlayingChord] = useState<string | null>(null)
  const [playingProgression, setPlayingProgression] = useState(false)
  const [customChord, setCustomChord] = useState("")
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [possibleChords, setPossibleChords] = useState<any[]>([])

  const addChord = (chord: string) => {
    setProgression([...progression, chord])
  }

  const removeChord = (index: number) => {
    setProgression(progression.filter((_, i) => i !== index))
  }

  const clearProgression = () => {
    setProgression([])
  }

  const loadProgression = (chords: string[]) => {
    setProgression(chords)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(progression)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setProgression(items)
  }

  const handleAddCustomChord = () => {
    const chord = customChord.trim()
    if (chord) {
      // Validate chord exists by checking if we can get chord data
      const chordData = getChordData(chord)
      if (chordData) {
        addChord(chord)
        setCustomChord("")
        toast.success(`Added ${chord} to progression`)
      } else {
        toast.error(`Chord "${chord}" not recognized. Try a different spelling.`)
      }
    }
  }

  // Handle note selection for chord building
  const toggleNote = (note: string) => {
    let newNotes: string[]
    if (selectedNotes.includes(note)) {
      newNotes = selectedNotes.filter((n) => n !== note)
    } else {
      newNotes = [...selectedNotes, note]
    }
    setSelectedNotes(newNotes)

    // Find possible chords when we have 2+ notes
    if (newNotes.length >= 2) {
      const chords = identifyChordFromNotes(newNotes)
      setPossibleChords(chords)
    } else {
      setPossibleChords([])
    }
  }

  const clearSelectedNotes = () => {
    setSelectedNotes([])
    setPossibleChords([])
  }

  const addChordFromNotes = (chordName: string) => {
    addChord(chordName)
    toast.success(`Added ${chordName} to progression`)
  }

  // Play individual chord
  const playChord = async (chordName: string) => {
    if (playingChord === chordName) return

    setPlayingChord(chordName)

    try {
      const chordData = getChordData(chordName)
      if (chordData && chordData.variations.length > 0) {
        const positions = chordData.variations[0].positions
        const success = await playChordFromPositions(positions, chordName.charAt(0))

        if (!success) {
          toast.error("Could not play chord audio")
        }
      } else {
        toast.error("Chord fingering not available")
      }
    } catch (error) {
      console.error("Error playing chord:", error)
      toast.error("Audio playback failed")
    }

    // Reset playing state after delay
    setTimeout(() => {
      setPlayingChord(null)
    }, 2000)
  }

  // Play entire progression
  const playProgression = async () => {
    if (playingProgression || progression.length === 0) return

    setPlayingProgression(true)

    try {
      for (let i = 0; i < progression.length; i++) {
        const chordName = progression[i]
        setPlayingChord(chordName)

        const chordData = getChordData(chordName)
        if (chordData && chordData.variations.length > 0) {
          const positions = chordData.variations[0].positions
          await playChordFromPositions(positions, chordName.charAt(0))
        }

        // Wait between chords
        if (i < progression.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
      }
    } catch (error) {
      console.error("Error playing progression:", error)
      toast.error("Progression playback failed")
    }

    setPlayingChord(null)
    setPlayingProgression(false)
  }

  const saveCurrentProgression = () => {
    if (!user) {
      toast.error("Please sign in to save progressions")
      return
    }

    if (!progressionName.trim()) {
      toast.error("Please enter a name for your progression")
      return
    }

    if (progression.length === 0) {
      toast.error("Please add some chords to your progression")
      return
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    saveProgression(
      user.id,
      progressionName.trim(),
      progression,
      progressionDescription.trim() || undefined,
      tagArray.length > 0 ? tagArray : undefined,
    )

    toast.success("Progression saved successfully!")

    // Clear form
    setProgressionName("")
    setProgressionDescription("")
    setTags("")
  }

  return (
    <div className="space-y-6">
      <Card className="chord-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Chord Progression Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">Build and save your chord progressions</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Common Chords */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Add Chords</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {commonChords.map((chord) => (
                <Button
                  key={chord}
                  variant="outline"
                  size="sm"
                  onClick={() => addChord(chord)}
                  className="text-sm h-10 transition-all hover:bg-blue-50 hover:border-blue-300"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {chord}
                </Button>
              ))}
            </div>

            {/* Custom Chord Input with Tabs */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium mb-3">Add Custom Chord</h4>

              <Tabs defaultValue="name" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="name">By Name</TabsTrigger>
                  <TabsTrigger value="notes">By Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="name" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter chord name (e.g., Cmaj7, F#m, Bb9)"
                      value={customChord}
                      onChange={(e) => setCustomChord(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomChord()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddCustomChord}
                      disabled={!customChord.trim()}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Try: Cmaj7, Am7, F#dim, Bbsus4, G13, etc.</p>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Select notes to build a chord:</p>

                    {/* Note Selection Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 mb-4">
                      {allNotes.map((note) => {
                        const isSelected = selectedNotes.includes(note)
                        return (
                          <Button
                            key={note}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleNote(note)}
                            className={`h-10 w-full text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-md transform scale-105"
                                : "hover:bg-green-50 hover:border-green-300"
                            }`}
                          >
                            {note}
                          </Button>
                        )
                      })}
                    </div>

                    {/* Selected Notes Display */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Selected Notes: </span>
                        {selectedNotes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedNotes.map((note) => (
                              <Badge key={note} variant="secondary" className="bg-green-100 text-green-800">
                                {note}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelectedNotes}
                        className="gap-1 self-start sm:self-center"
                        disabled={selectedNotes.length === 0}
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </Button>
                    </div>

                    {/* Possible Chords Results */}
                    {selectedNotes.length >= 2 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Music className="h-4 w-4" />
                          Possible Chords ({possibleChords.length})
                        </h5>

                        {possibleChords.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {possibleChords.slice(0, 6).map((chord, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-between h-auto p-3 text-left hover:bg-green-50 hover:border-green-300"
                                onClick={() => addChordFromNotes(chord.name)}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-semibold">{chord.name}</span>
                                  <span className="text-xs text-muted-foreground">{chord.notes.join(", ")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant={chord.confidence > 80 ? "default" : "secondary"}
                                    className={`text-xs ${chord.confidence > 80 ? "bg-green-600" : ""}`}
                                  >
                                    {chord.confidence}%
                                  </Badge>
                                  <Plus className="h-3 w-3" />
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground bg-white rounded-lg border">
                            <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No chords found with these notes</p>
                            <p className="text-xs">Try adding or removing notes</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedNotes.length === 1 && (
                      <div className="text-center py-4 text-muted-foreground bg-blue-50 rounded-lg border">
                        <Music className="mx-auto h-8 w-8 mb-2 text-blue-400" />
                        <p className="text-sm font-medium text-blue-700">Select one more note</p>
                        <p className="text-xs text-blue-600">Chords need at least 2 notes</p>
                      </div>
                    )}

                    {selectedNotes.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Select notes above to build a chord</p>
                        <p className="text-xs">Click on the note buttons to get started</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Common Progressions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Common Progressions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {commonProgressions.map((prog, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                  onClick={() => loadProgression(prog.chords)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm mb-2">{prog.name}</h4>
                    <div className="flex flex-wrap gap-1">
                      {prog.chords.map((chord, chordIndex) => (
                        <Badge key={chordIndex} variant="outline" className="text-xs">
                          {chord}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Progression */}
      <Card className="chord-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Progression</span>
            <div className="flex gap-2">
              {progression.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playProgression}
                  disabled={playingProgression}
                  className="gap-1"
                >
                  {playingProgression ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play All
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearProgression}>
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progression.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListMusic className="mx-auto h-12 w-12 mb-4" />
              <p>No chords added yet. Click on chords above to build your progression.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="progression" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                  >
                    {progression.map((chord, index) => (
                      <Draggable key={`${chord}-${index}`} draggableId={`${chord}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                              playingChord === chord
                                ? "bg-blue-600 text-white shadow-lg animate-pulse"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            } ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">{chord}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playChord(chord)}
                              disabled={playingChord === chord}
                              className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                            >
                              {playingChord === chord ? (
                                <Volume2 className="h-3 w-3 animate-pulse" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChord(index)}
                              className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Save Progression */}
      {progression.length > 0 && (
        <Card className="chord-card">
          <CardHeader>
            <CardTitle>Save Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                placeholder="Enter progression name..."
                value={progressionName}
                onChange={(e) => setProgressionName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Optional description..."
                value={progressionDescription}
                onChange={(e) => setProgressionDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <Input
                placeholder="Enter tags separated by commas..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <Button onClick={saveCurrentProgression} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Progression
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
