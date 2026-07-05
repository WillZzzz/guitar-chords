"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
import { Heart, ListMusic, Clock, BarChart3, Trash2, Music, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export type LibraryTab = "favorites" | "progressions" | "history"

interface UserLibrarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: LibraryTab
  onChordSelect?: (chord: string) => void
}

export default function UserLibrarySheet({ open, onOpenChange, defaultTab = "favorites", onChordSelect }: UserLibrarySheetProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<LibraryTab>(defaultTab)
  const [favorites, setFavorites] = useState<FavoriteChord[]>([])
  const [progressions, setProgressions] = useState<SavedProgression[]>([])
  const [history, setHistory] = useState<ChordLookup[]>([])

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    if (open && user) {
      setFavorites(getFavoriteChords(user.id))
      setProgressions(getSavedProgressions(user.id))
      setHistory(getChordLookups(user.id))
    }
  }, [open, user])

  const handleChordClick = (chordName: string) => {
    onChordSelect?.(chordName)
    onOpenChange(false)
  }

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>My Library</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid grid-cols-3 mx-6 mt-4 shrink-0">
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="progressions" className="gap-1.5">
              <ListMusic className="h-3.5 w-3.5" />
              Progressions
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Favorites */}
          <TabsContent value="favorites" className="flex-1 overflow-y-auto px-6 py-4 space-y-2 mt-0">
            {!user ? (
              <EmptyState icon={<Heart className="h-10 w-10" />} message="Sign in to view your favorites" />
            ) : favorites.length === 0 ? (
              <EmptyState icon={<Heart className="h-10 w-10" />} message="No favorites yet — heart a chord in the Chord Finder" />
            ) : (
              favorites.map((fav) => (
                <Card key={fav.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => handleChordClick(fav.chord_name)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg p-2">
                        <Music className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{fav.chord_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(fav.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); handleChordClick(fav.chord_name) }}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleRemoveFavorite(fav, e)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Progressions */}
          <TabsContent value="progressions" className="flex-1 overflow-y-auto px-6 py-4 space-y-2 mt-0">
            {!user ? (
              <EmptyState icon={<ListMusic className="h-10 w-10" />} message="Sign in to view your saved progressions" />
            ) : progressions.length === 0 ? (
              <EmptyState icon={<ListMusic className="h-10 w-10" />} message="No saved progressions yet — build one in the Progression Builder" />
            ) : (
              progressions.map((prog) => (
                <Card key={prog.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{prog.name}</p>
                        {prog.description && (
                          <p className="text-xs text-muted-foreground truncate">{prog.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prog.chords.map((chord, i) => (
                            <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-accent"
                              onClick={() => handleChordClick(chord)}>
                              {chord}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(prog.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDeleteProgression(prog.id, e)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="flex-1 overflow-y-auto px-6 py-4 space-y-2 mt-0">
            {!user ? (
              <EmptyState icon={<Clock className="h-10 w-10" />} message="Sign in to track your search history" />
            ) : history.length === 0 ? (
              <EmptyState icon={<Clock className="h-10 w-10" />} message="No history yet — start looking up chords" />
            ) : (
              history.map((lookup) => (
                <Card key={lookup.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => handleChordClick(lookup.chord_name)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg p-2">
                        <Music className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{lookup.chord_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lookup.looked_up_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <BarChart3 className="h-3 w-3" />
                      {lookup.count}×
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-muted-foreground/40">{icon}</div>
      <p className="text-sm text-muted-foreground max-w-[220px]">{message}</p>
    </div>
  )
}
