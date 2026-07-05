"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, ListMusic, Clock, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import AuthModal from "./auth-modal"
import UserLibrarySheet, { type LibraryTab } from "@/components/user-features/user-library-sheet"

interface UserMenuProps {
  onChordSelect?: (chord: string) => void
}

export default function UserMenu({ onChordSelect }: UserMenuProps) {
  const { user, signOut, passwordRecovery } = useAuth()
  const { t } = useLanguage()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("favorites")

  useEffect(() => {
    if (passwordRecovery) {
      setAuthModalOpen(true)
    }
  }, [passwordRecovery])

  const openLibrary = (tab: LibraryTab) => {
    setLibraryTab(tab)
    setLibraryOpen(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const displayName = user
    ? (user.user_metadata?.display_name || user.email?.split("@")[0] || "User")
    : null
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : null

  return (
    <>
      {/* Always mounted so passwordRecovery can open it even when logged in */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {user && (
        <UserLibrarySheet
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          defaultTab={libraryTab}
          onChordSelect={onChordSelect}
        />
      )}

      {!user ? (
        <Button variant="outline" size="icon" onClick={() => setAuthModalOpen(true)} className="h-9 w-9">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="sr-only">Sign In</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openLibrary("favorites")}>
              <Heart className="mr-2 h-4 w-4" />
              Favorite Chords
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openLibrary("progressions")}>
              <ListMusic className="mr-2 h-4 w-4" />
              Saved Progressions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openLibrary("history")}>
              <Clock className="mr-2 h-4 w-4" />
              Search History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("auth.sign-out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
