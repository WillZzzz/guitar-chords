"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRelatedChords } from "@/lib/chord-utils"
import { getChordData } from "@/lib/chord-utils"

interface RelatedChordsProps {
  chordName: string
  onChordSelect: (chord: string) => void
}

export default function RelatedChords({ chordName, onChordSelect }: RelatedChordsProps) {
  const relatedChords = getRelatedChords(chordName)

  if (!relatedChords || relatedChords.length === 0) {
    return (
      <Card className="chord-card">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
          <CardTitle>Related Chords</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>No related chords found for {chordName}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="chord-card overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
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
              className="lucide lucide-git-branch"
            >
              <line x1="6" x2="6" y1="3" y2="15"></line>
              <circle cx="18" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            Related Chords
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="p-6">
        <div className="space-y-6">
          {relatedChords.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
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
                  className="lucide lucide-folder-open"
                >
                  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                </svg>
                {group.relationship}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {group.chords.map((chord, chordIndex) => {
                  const relatedChordData = getChordData(chord.name)
                  return (
                    <Button
                      key={chordIndex}
                      variant="outline"
                      onClick={() => onChordSelect(chord.name)}
                      className="flex flex-col items-start p-3 h-auto min-w-[120px] transition-all hover:bg-gray-50 hover:border-gray-300"
                    >
                      <span className="font-medium text-lg">{chord.name}</span>
                      {chord.description && <span className="text-xs text-muted-foreground">{chord.description}</span>}
                      {relatedChordData && (
                        <span className="text-xs mt-1 text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                          {relatedChordData.notes.join(", ")}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
              {group.explanation && (
                <p className="text-sm text-muted-foreground mt-2 bg-purple-50 p-3 rounded-md border border-purple-100">
                  {group.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
