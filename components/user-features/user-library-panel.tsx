"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import {
  getFavoriteChords,
  removeFavoriteChord,
  getSavedProgressions,
  deleteSavedProgression,
  getChordLookups,
  type FavoriteChord,
  type SavedProgression,
  type ChordLookup,
} from "@/lib/local-storage"
import { formatDistanceToNow } from "date-fns"
import { Heart, ListMusic, Clock, BarChart3, Trash2, Music, ExternalLink, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export type LibraryTab = "favorites" | "progressions" | "history"

export interface UserLibraryPanelProps {
  onChordSelect?: (chord: string) => void
  onProgressionSelect?: (chords: string[]) => void
  /** Called after each data-mutating action so parent can refresh if needed */
  onDataChange?: () => void
}

export default function UserLibraryPanel({ onChordSelect, onProgressionSelect }: UserLibraryPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<LibraryTab>("favorites")
  const [favorites, setFavorites] = useState<FavoriteChord[]>([])
  const [progressions, setProgressions] = useState<SavedProgression[]>([])
  const [history, setHistory] = useState<ChordLookup[]>([])

  const reload = () => {
    if (!user) return
    setFavorites(getFavoriteChords(user.id))
    setProgressions(getSavedProgressions(user.id))
    setHistory(getChordLookups(user.id))
  }

  useEffect(() => {
    reload()
  }, [user])

  const handleRemoveFavorite = (fav: FavoriteChord, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    removeFavoriteChord(user.id, fav.chord_name, fav.chord_type)
    setFavorites(getFavoriteChords(user.id))
    toast.success("Removed from favorites")
  }

  const handleDeleteProgression = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    deleteSavedProgression(user.id, id)
    setProgressions(getSavedProgressions(user.id))
    toast.success("Progression deleted")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b">
        <h2 className="font-semibold text-sm">My Library</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="flex flex-col flex-1 min-h-0">
        <TabsList className="grid grid-cols-3 mx-4 mt-3 shrink-0">
          <TabsTrigger value="favorites" className="gap-1 text-xs px-1">
            <Heart className="h-3 w-3" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="progressions" className="gap-1 text-xs px-1">
            <ListMusic className="h-3 w-3" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1 text-xs px-1">
            <Clock className="h-3 w-3" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Favorites */}
        <TabsContent value="favorites" className="flex-1 overflow-y-auto px-4 py-3 space-y-2 mt-0">
          {!user ? (
            <EmptyState icon={<Heart className="h-8 w-8" />} message="Sign in to view your favorites" />
          ) : favorites.length === 0 ? (
            <EmptyState icon={<Heart className="h-8 w-8" />} message="Heart a chord in the Chord Finder to save it here" />
          ) : (
            favorites.map((fav) => (
              <Card key={fav.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onChordSelect?.(fav.chord_name)}>
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-md p-1.5 shrink-0">
                      <Music className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{fav.chord_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(fav.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); onChordSelect?.(fav.chord_name) }}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleRemoveFavorite(fav, e)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Progressions */}
        <TabsContent value="progressions" className="flex-1 overflow-y-auto px-4 py-3 space-y-2 mt-0">
          {!user ? (
            <EmptyState icon={<ListMusic className="h-8 w-8" />} message="Sign in to view your saved progressions" />
          ) : progressions.length === 0 ? (
            <EmptyState icon={<ListMusic className="h-8 w-8" />} message="Save a progression in the Progression Builder" />
          ) : (
            progressions.map((prog) => (
              <Card key={prog.id}
                className="cursor-pointer hover:shadow-sm hover:border-orange-300 transition-all"
                onClick={() => onProgressionSelect?.(prog.chords)}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <p className="font-semibold text-sm truncate">{prog.name}</p>
                        <ArrowRight className="h-3 w-3 text-orange-500 shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prog.chords.slice(0, 6).map((chord, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">{chord}</Badge>
                        ))}
                        {prog.chords.length > 6 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">+{prog.chords.length - 6}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatDistanceToNow(new Date(prog.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDeleteProgression(prog.id, e)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="flex-1 overflow-y-auto px-4 py-3 space-y-2 mt-0">
          {!user ? (
            <EmptyState icon={<Clock className="h-8 w-8" />} message="Sign in to track your search history" />
          ) : history.length === 0 ? (
            <EmptyState icon={<Clock className="h-8 w-8" />} message="Start looking up chords to build your history" />
          ) : (
            history.map((lookup) => (
              <Card key={lookup.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onChordSelect?.(lookup.chord_name)}>
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-md p-1.5 shrink-0">
                      <Music className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{lookup.chord_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(lookup.looked_up_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs shrink-0">
                    <BarChart3 className="h-3 w-3" />
                    {lookup.count}×
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div className="text-muted-foreground/30">{icon}</div>
      <p className="text-xs text-muted-foreground max-w-[180px]">{message}</p>
    </div>
  )
}
