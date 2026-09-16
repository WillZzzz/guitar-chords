'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, Target, Info } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { type ChordScaleAnalysis, getChordNoteColor } from '@/lib/scale-analysis'

interface ScaleDisplayProps {
  analysis: ChordScaleAnalysis
  chordName: string
  showPrimary?: boolean
  showAlternatives?: boolean
}

export default function ScaleDisplay({ 
  analysis, 
  chordName, 
  showPrimary = true, 
  showAlternatives = true 
}: ScaleDisplayProps) {
  const { t } = useLanguage()

  if (!analysis.primaryScale) {
    return null
  }

  const { primaryScale, alternativeScales, chordFunction } = analysis

  return (
    <div className="space-y-6">
      {/* Primary Scale */}
      {showPrimary && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#bf6f4a]" />
            {t('theory.primary-scale')}
          </CardTitle>
          <CardDescription>
            {chordName} {t('theory.chord-from-scale')} <strong>{primaryScale.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Scale Notes Visualization */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Music className="h-4 w-4" />
              {t('theory.scale-notes')}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {primaryScale.notes.map((note, index) => {
                const isHighlighted = primaryScale.highlightedIndices.includes(index)
                const colorClass = getChordNoteColor(
                  primaryScale.highlightedIndices.indexOf(index),
                  isHighlighted
                )

                return (
                  <div
                    key={index}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${colorClass} ${
                      isHighlighted ? 'ring-2 ring-offset-2 ring-[#bf6f4a] scale-110' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{note}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {primaryScale.scaleDegrees[index]}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chord Function */}
          <div className="bg-[#fbf4ef] dark:bg-[#282320]/60 px-3 py-2 rounded-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-[#bf6f4a] shrink-0" />
            <p className="text-sm text-[#6b5f55] dark:text-[#d4cdc4] truncate">
              <span className="font-medium text-[#37302a] dark:text-foreground">{t('theory.chord-function')}:</span>{' '}
              {chordFunction}
            </p>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Alternative Scales */}
      {showAlternatives && alternativeScales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-[#bf6f4a]" />
              {t('theory.alternative-scales')}
            </CardTitle>
            <CardDescription>
              {t('theory.other-scales-containing')} {chordName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alternativeScales.map((scale, scaleIndex) => (
              <div key={scaleIndex} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">{scale.name}</h4>
                <div className="flex flex-wrap gap-1">
                  {scale.notes.map((note, noteIndex) => {
                    const isHighlighted = scale.highlightedIndices.includes(noteIndex)
                    return (
                      <Badge
                        key={noteIndex}
                        variant={isHighlighted ? "default" : "outline"}
                        className={`text-xs ${
                          isHighlighted
                            ? 'bg-[#bf6f4a] hover:bg-[#a05537]'
                            : 'text-gray-500 dark:text-muted-foreground'
                        }`}
                      >
                        {note}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}