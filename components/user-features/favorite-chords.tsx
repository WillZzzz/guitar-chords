"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getFavoriteChords, removeFavoriteChord, type FavoriteChord } from "@/lib/local-storage"
import { formatDistanceToNow } from "date-fns"
import { Heart, Music, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FavoriteChordsProps {
  onChordSelect?: (chord: string) => void
}

export default function FavoriteChords({ onChordSelect }: FavoriteChordsProps) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteChord[]>([])

  useEffect(() => {
    if (user) {
      const userFavorites = getFavoriteChords(user.id)
      setFavorites(userFavorites)
    }
  }, [user])

  const handleChordClick = (favorite: FavoriteChord) => {
    if (onChordSelect) {
      onChordSelect(`${favorite.root_note}${favorite.chord_type}`)
    }
  }

  const handleRemoveFavorite = (favorite: FavoriteChord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      removeFavoriteChord(user.id, favorite.chord_name, favorite.chord_type)
      setFavorites(getFavoriteChords(user.id))
      toast.success("Removed from favorites")
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to view your favorite chords</h3>
          <p className="text-muted-foreground">Save your favorite chords for quick access</p>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No favorite chords yet</h3>
          <p className="text-muted-foreground">Click the heart icon on any chord to add it to your favorites</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Favorite Chords
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your saved favorite chords for quick access</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="chord-card cursor-pointer" onClick={() => handleChordClick(favorite)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-3">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{favorite.chord_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Added {formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleRemoveFavorite(favorite, e)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
