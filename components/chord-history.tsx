"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, X, Trash2 } from "lucide-react"
import { useChordHistory } from "@/hooks/use-chord-history"
import { formatDistanceToNow } from "date-fns"

interface ChordHistoryProps {
  onChordSelect?: (chord: string) => void
}

export default function ChordHistory({ onChordSelect }: ChordHistoryProps) {
  const { history, clearHistory, removeFromHistory } = useChordHistory()
  const [isExpanded, setIsExpanded] = useState(false)

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Chords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No chord history yet. Start exploring chords to see them here!
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayedHistory = isExpanded ? history : history.slice(0, 6)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Chords
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {displayedHistory.map((item) => (
            <div key={`${item.chord}-${item.timestamp}`} className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onChordSelect?.(item.chord)}
              >
                {item.chord}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                onClick={() => removeFromHistory(item.chord)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        {history.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? "Show Less" : `Show ${history.length - 6} More`}
          </Button>
        )}
        
        {history.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Last viewed: {formatDistanceToNow(new Date(history[0].timestamp), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}