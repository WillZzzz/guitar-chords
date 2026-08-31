"use client"

import type React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function LibraryLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <div className="text-muted-foreground/30">{icon}</div>
      <p className="text-xs text-muted-foreground max-w-[180px]">{message}</p>
    </div>
  )
}
