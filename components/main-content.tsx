"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChordFinder from "@/components/chord-finder"
import ChordFinderReverse from "@/components/chord-finder-reverse"
import ChordProgressionBuilder from "@/components/chord-progression-builder"
import AuthModal from "@/components/auth/auth-modal"
import UserMenu from "@/components/auth/user-menu"
import LanguageToggle from "@/components/language-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Music } from "lucide-react"

export default function MainContent() {
  const [selectedChord, setSelectedChord] = useState("C")
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header with Fixed Button Spacing */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20 gap-4">
            {/* Left spacer */}
            <div className="hidden sm:block"></div>

            {/* Centered Logo/Title */}
            <div className="flex items-center justify-center space-x-3 col-span-3 sm:col-span-1">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-1 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                  Guitar Chord Theory
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Master chords, theory & progressions</p>
              </div>
            </div>

            {/* Right side controls - positioned absolutely on mobile */}
            <div className="hidden sm:flex items-center justify-end space-x-4">
              <LanguageToggle />
              <UserMenu />
              {!user && <AuthModal />}
            </div>

            {/* Mobile controls - separate row */}
            <div className="sm:hidden fixed top-4 right-4 flex items-center space-x-3 z-50">
              <LanguageToggle />
              <UserMenu />
              {!user && <AuthModal />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="finder" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="finder"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                Chord Finder
              </TabsTrigger>
              <TabsTrigger
                value="reverse"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
              >
                Reverse Lookup
              </TabsTrigger>
              <TabsTrigger
                value="progression"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                Progression Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="finder" className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <ChordFinder onChordSelect={setSelectedChord} />
              </div>
            </TabsContent>

            <TabsContent value="reverse" className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
                <ChordFinderReverse onChordSelect={setSelectedChord} />
              </div>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                <ChordProgressionBuilder />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
