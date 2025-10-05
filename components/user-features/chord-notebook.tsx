"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getChordLookups, type ChordLookup } from "@/lib/local-storage"
import { formatDistanceToNow } from "date-fns"
import { Music, Clock, BarChart3 } from "lucide-react"

interface ChordNotebookProps {
  onChordSelect?: (chord: string) => void
}

export default function ChordNotebook({ onChordSelect }: ChordNotebookProps) {
  const { user } = useAuth()
  const [lookups, setLookups] = useState<ChordLookup[]>([])

  useEffect(() => {
    if (user) {
      const userLookups = getChordLookups(user.id)
      setLookups(userLookups)
    }
  }, [user])

  const handleChordClick = (lookup: ChordLookup) => {
    if (onChordSelect) {
      onChordSelect(`${lookup.root_note}${lookup.chord_type}`)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to view your chord notebook</h3>
          <p className="text-muted-foreground">Your chord lookup history will be automatically saved here</p>
        </CardContent>
      </Card>
    )
  }

  if (lookups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your chord notebook is empty</h3>
          <p className="text-muted-foreground">Start looking up chords and they'll appear here automatically</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Chord Notebook
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your chord lookup history from the past 30 days</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {lookups.map((lookup) => (
          <Card key={lookup.id} className="chord-card cursor-pointer" onClick={() => handleChordClick(lookup)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-3">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{lookup.chord_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(lookup.looked_up_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {lookup.count} {lookup.count === 1 ? "time" : "times"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
