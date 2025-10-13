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
            <Target className="h-5 w-5 text-green-600" />
            {t('theory.primary-scale')}
          </CardTitle>
          <CardDescription>
            {chordName} {t('theory.chord-from-scale')} <strong>{primaryScale.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    className={`relative px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${colorClass} ${
                      isHighlighted ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{note}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {primaryScale.scaleDegrees[index]}
                      </div>
                    </div>
                    {isHighlighted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chord Function */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('theory.chord-function')}:
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {chordFunction}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{t('theory.legend')}:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{t('theory.root-note')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{t('theory.third')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{t('theory.fifth')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>{t('theory.seventh')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>{t('theory.scale-note')}</span>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Alternative Scales */}
      {showAlternatives && alternativeScales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-600" />
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
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'text-gray-500'
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