"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import UserLibraryPanel, { type UserLibraryPanelProps } from "./user-library-panel"

interface UserLibrarySheetProps extends UserLibraryPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserLibrarySheet({ open, onOpenChange, ...panelProps }: UserLibrarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col p-0" side="right">
        <SheetHeader className="sr-only">
          <SheetTitle>My Library</SheetTitle>
        </SheetHeader>
        <UserLibraryPanel {...panelProps} />
      </SheetContent>
    </Sheet>
  )
}
