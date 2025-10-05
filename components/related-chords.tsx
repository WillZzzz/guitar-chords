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
      <Card>
        <CardHeader>
          <CardTitle>Related Chords</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No related chords found for {chordName}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Chords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedChords.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-lg font-medium mb-2">{group.relationship}</h3>
              <div className="flex flex-wrap gap-2">
                {group.chords.map((chord, chordIndex) => {
                  const relatedChordData = getChordData(chord.name)
                  return (
                    <Button
                      key={chordIndex}
                      variant="outline"
                      onClick={() => onChordSelect(chord.name)}
                      className="flex flex-col items-start p-3 h-auto min-w-[120px]"
                    >
                      <span className="font-medium">{chord.name}</span>
                      {chord.description && <span className="text-xs text-muted-foreground">{chord.description}</span>}
                      {relatedChordData && (
                        <span className="text-xs mt-1 text-muted-foreground">{relatedChordData.notes.join(", ")}</span>
                      )}
                    </Button>
                  )
                })}
              </div>
              {group.explanation && <p className="text-sm text-muted-foreground mt-2">{group.explanation}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
