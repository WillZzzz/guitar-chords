"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getSavedProgressions, deleteSavedProgression, type SavedProgression } from "@/lib/local-storage"
import { formatDistanceToNow } from "date-fns"
import { ListMusic, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function SavedProgressions() {
  const { user } = useAuth()
  const [progressions, setProgressions] = useState<SavedProgression[]>([])

  useEffect(() => {
    if (user) {
      const userProgressions = getSavedProgressions(user.id)
      setProgressions(userProgressions)
    }
  }, [user])

  const handleDeleteProgression = (progressionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      deleteSavedProgression(user.id, progressionId)
      setProgressions(getSavedProgressions(user.id))
      toast.success("Progression deleted")
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ListMusic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to view your saved progressions</h3>
          <p className="text-muted-foreground">Save your chord progressions for later practice</p>
        </CardContent>
      </Card>
    )
  }

  if (progressions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ListMusic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved progressions yet</h3>
          <p className="text-muted-foreground">Create chord progressions in the builder and save them here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Saved Progressions
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your saved chord progressions for practice and reference</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {progressions.map((progression) => (
          <Card key={progression.id} className="chord-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-3">
                      <ListMusic className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{progression.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(progression.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {progression.description && (
                    <p className="text-sm text-muted-foreground mb-3 ml-14">{progression.description}</p>
                  )}

                  <div className="ml-14 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {progression.chords.map((chord, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {chord}
                        </Badge>
                      ))}
                    </div>

                    {progression.tags && progression.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {progression.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteProgression(progression.id, e)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
