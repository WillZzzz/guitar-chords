"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getChordData, findScalesContainingChord } from "@/lib/chord-utils"

interface ChordTheoryProps {
  chordName: string
}

export default function ChordTheory({ chordName }: ChordTheoryProps) {
  const chordData = getChordData(chordName)

  if (!chordData) {
    return null
  }

  const scalesContainingChord = findScalesContainingChord(chordName)

  // Get the root note from the chord name
  const rootNote = chordName.charAt(0)

  // Create the major scale for this root note
  const majorScaleNotes = getMajorScale(rootNote)

  return (
    <Card className="chord-card overflow-hidden">
      <div className="bg-gradient-to-r from-cookie-600 to-cookie-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-brain-circuit"
            >
              <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"></path>
              <path d="m15.7 10.4-.9.4"></path>
              <path d="m9.2 13.2-.9.4"></path>
              <path d="m13.6 15.7-.4-.9"></path>
              <path d="m10.8 9.2-.4-.9"></path>
              <path d="m15.7 13.5-.9-.4"></path>
              <path d="m9.2 10.9-.9-.4"></path>
              <path d="m10.5 15.7.4-.9"></path>
              <path d="m13.1 9.2.4-.9"></path>
            </svg>
            Music Theory
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-tag"
              >
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                <path d="M7 7h.01"></path>
              </svg>
              Chord Type
            </h3>
            <p className="text-muted-foreground">{chordData.type} chord</p>
            {chordData.type === "Suspended" && (
              <p className="text-muted-foreground mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                A suspended chord replaces the 3rd with either a 2nd (sus2) or 4th (sus4), creating tension that
                "suspends" and wants to resolve back to a major or minor chord.
              </p>
            )}
            {chordData.type === "Add9" && (
              <p className="text-muted-foreground mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                An add9 chord adds the 9th note of the scale (same as the 2nd but an octave higher) to a basic triad
                without removing any notes, creating a fuller sound.
              </p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-music"
              >
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              Notes in {rootNote} Major Scale
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {majorScaleNotes.map((note, index) => {
                const isInChord = chordData.notes.includes(note)
                return (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isInChord
                        ? "bg-gradient-to-r from-cookie-500 to-cookie-600 text-white font-medium shadow-sm"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {note}
                    <sub className="ml-0.5">{getScaleDegree(index + 1)}</sub>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground">Highlighted notes are used in the {chordData.name} chord.</p>
          </div>

          {scalesContainingChord.length > 0 ? (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list-music"
                >
                  <path d="M14 16H4"></path>
                  <path d="M14 12H4"></path>
                  <path d="M14 8H4"></path>
                  <path d="M20 8v8"></path>
                  <circle cx="20" cy="16" r="2"></circle>
                </svg>
                Found in these scales
              </h3>
              <ul className="space-y-2">
                {scalesContainingChord.map((scale, index) => (
                  <li key={index} className="text-muted-foreground bg-gray-50 p-2 rounded-md">
                    <span className="font-medium text-foreground">{scale.scaleName}</span>: {chordName} is the{" "}
                    <span className="font-medium text-foreground">
                      {scale.position}
                      {scale.function}
                    </span>{" "}
                    chord
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No common scales found containing this chord.</p>
          )}

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-function-square"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3 3-3"></path>
                <path d="M9 11.2h5.7"></path>
              </svg>
              Harmonic Function
            </h3>
            <p className="text-muted-foreground">
              {chordData.function ||
                "This chord can serve various harmonic functions depending on the musical context."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get the major scale for a given root note
function getMajorScale(rootNote: string): string[] {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const majorScalePattern = [0, 2, 4, 5, 7, 9, 11] // Whole, Whole, Half, Whole, Whole, Whole, Half steps

  let rootIndex = allNotes.indexOf(rootNote)
  if (rootIndex === -1) rootIndex = 0 // Default to C if not found

  return majorScalePattern.map((interval) => allNotes[(rootIndex + interval) % 12])
}

// Helper function to get the scale degree notation
function getScaleDegree(degree: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][degree - 1]
}
