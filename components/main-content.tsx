"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ChordFinder from "@/components/chord-finder"
import ChordFinderReverse from "@/components/chord-finder-reverse"
import ChordProgressionBuilder from "@/components/chord-progression-builder"
import UserMenu from "@/components/auth/user-menu"
import LanguageToggle from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import MyChordsPanel from "@/components/user-features/my-chords-panel"
import MyProgressionsPanel from "@/components/user-features/my-progressions-panel"
import HistoryPanel from "@/components/user-features/history-panel"
import LibrarySheet from "@/components/user-features/library-sheet"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { EditableProgression } from "@/lib/user-data"
import { Music, Heart, ListMusic, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { TAB_THEME as TAB_ACCENTS } from "@/lib/tab-theme"

const TAB_THEME = {
  finder: {
    accent: TAB_ACCENTS.finder.accent,
    logoGradient: `linear-gradient(135deg, ${TAB_ACCENTS.finder.accentDark}, ${TAB_ACCENTS.finder.accent})`,
    badgeGradient: `linear-gradient(135deg, ${TAB_ACCENTS.finder.accentDark}, #f97316)`,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.finder.accent} 50%, ${TAB_ACCENTS.finder.accentDark})`,
  },
  reverse: {
    accent: TAB_ACCENTS.reverse.accent,
    logoGradient: `linear-gradient(135deg, ${TAB_ACCENTS.reverse.accent}, ${TAB_ACCENTS.reverse.accent})`,
    badgeGradient: `linear-gradient(135deg, ${TAB_ACCENTS.reverse.accent}, ${TAB_ACCENTS.reverse.accentDark})`,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.reverse.accent} 50%, ${TAB_ACCENTS.reverse.accentDark})`,
  },
  progression: {
    accent: TAB_ACCENTS.progression.accent,
    logoGradient: TAB_ACCENTS.progression.accent,
    badgeGradient: TAB_ACCENTS.progression.accent,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.progression.accent} 50%, ${TAB_ACCENTS.progression.accentDark})`,
  },
} as const

function CollapsedSidebarRail({
  label,
  count,
  accent,
  onExpand,
}: {
  label: string
  count: number
  accent: string
  onExpand: () => void
}) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex flex-col items-center gap-3 w-full py-4 rounded-xl border border-[#e6dcd2] dark:border-slate-700 bg-[#fffdfa] dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
      title={label}
    >
      <ChevronLeft className="h-4 w-4" style={{ color: accent }} />
      <span
        className="text-xs font-medium text-muted-foreground"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {label}
      </span>
      {count > 0 && (
        <span
          className="flex items-center justify-center text-[10px] font-semibold text-white rounded-full h-5 w-5"
          style={{ backgroundColor: accent }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export default function MainContent() {
  const [selectedChord, setSelectedChord] = useState("C")
  const [activeTab, setActiveTab] = useState("finder")
  const theme = TAB_THEME[activeTab as keyof typeof TAB_THEME] ?? TAB_THEME.finder
  const [chordsSheetOpen, setChordsSheetOpen] = useState(false)
  const [progressionsSheetOpen, setProgressionsSheetOpen] = useState(false)
  const [historySheetOpen, setHistorySheetOpen] = useState(false)
  const [pendingProgression, setPendingProgression] = useState<string[] | undefined>()
  const [editingProgression, setEditingProgression] = useState<EditableProgression | undefined>()
  const [chordsSidebarCollapsed, setChordsSidebarCollapsed] = useState(true)
  const [progressionsSidebarCollapsed, setProgressionsSidebarCollapsed] = useState(true)
  const [chordsCount, setChordsCount] = useState(0)
  const [progressionsCount, setProgressionsCount] = useState(0)
  const { user } = useAuth()
  const { t } = useLanguage()

  const handleChordSelectFromLibrary = (chord: string) => {
    setSelectedChord(chord)
    setActiveTab("finder")
  }

  const handleProgressionSelect = (chords: string[]) => {
    setPendingProgression(chords)
    setEditingProgression(undefined)
    setActiveTab("progression")
  }

  const handleProgressionEdit = (progression: EditableProgression) => {
    setEditingProgression(progression)
    setPendingProgression(undefined)
    setActiveTab("progression")
  }

  return (
    <div className="min-h-screen bg-[#faf7f3] dark:bg-slate-900">
      {/* Mobile bottom sheets */}
      {user && (
        <>
          <LibrarySheet open={chordsSheetOpen} onOpenChange={setChordsSheetOpen} title={t("nav.my-chords")}>
            <MyChordsPanel
              onChordSelect={(chord) => { handleChordSelectFromLibrary(chord); setChordsSheetOpen(false) }}
            />
          </LibrarySheet>
          <LibrarySheet open={progressionsSheetOpen} onOpenChange={setProgressionsSheetOpen} title={t("nav.my-progressions")}>
            <MyProgressionsPanel
              onProgressionEdit={(progression) => { handleProgressionEdit(progression); setProgressionsSheetOpen(false) }}
            />
          </LibrarySheet>
          <LibrarySheet open={historySheetOpen} onOpenChange={setHistorySheetOpen} title={t("nav.history")}>
            <HistoryPanel
              onChordSelect={(chord) => { handleChordSelectFromLibrary(chord); setHistorySheetOpen(false) }}
              onProgressionSelect={(chords) => { handleProgressionSelect(chords); setHistorySheetOpen(false) }}
            />
          </LibrarySheet>
        </>
      )}

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden sm:grid sm:grid-cols-3 items-center h-20 gap-4">
            <div></div>

            {/* Centered Logo/Title */}
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-[background] duration-300"
                  style={{ background: theme.logoGradient }}
                >
                  <Music className="h-6 w-6 text-white" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse transition-[background] duration-300"
                  style={{ background: theme.badgeGradient }}
                />
              </div>
              <div className="space-y-1 text-center">
                <h1
                  className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent leading-tight transition-[background] duration-300"
                  style={{ backgroundImage: theme.headingGradient }}
                >
                  {t("header.title")}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">{t("header.subtitle")}</p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="hidden sm:flex items-center justify-end space-x-2">
              <ThemeToggle />
              <LanguageToggle />
              {user && (
                <Button variant="outline" size="icon" onClick={() => setHistorySheetOpen(true)} title={t("nav.history")}>
                  <Clock className="h-4 w-4" />
                  <span className="sr-only">{t("nav.history")}</span>
                </Button>
              )}
              <UserMenu />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden flex items-center justify-between h-20 px-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-[background] duration-300"
                  style={{ background: theme.logoGradient }}
                >
                  <Music className="h-5 w-5 text-white" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse transition-[background] duration-300"
                  style={{ background: theme.badgeGradient }}
                />
              </div>
              <div className="min-w-0">
                <h1
                  className="text-base font-bold bg-clip-text text-transparent truncate transition-[background] duration-300"
                  style={{ backgroundImage: theme.headingGradient }}
                >
                  {t("header.title")}
                </h1>
                <p className="text-xs text-gray-500 font-medium truncate">{t("header.subtitle")}</p>
              </div>
            </div>

            {/* Mobile controls — contextual library icon + always-visible history, both only when logged in */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
              {user && activeTab === "finder" && (
                <Button variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setChordsSheetOpen(true)} title={t("nav.my-chords")}>
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">{t("nav.my-chords")}</span>
                </Button>
              )}
              {user && activeTab === "progression" && (
                <Button variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setProgressionsSheetOpen(true)} title={t("nav.my-progressions")}>
                  <ListMusic className="h-4 w-4" />
                  <span className="sr-only">{t("nav.my-progressions")}</span>
                </Button>
              )}
              {user && (
                <Button variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setHistorySheetOpen(true)} title={t("nav.history")}>
                  <Clock className="h-4 w-4" />
                  <span className="sr-only">{t("nav.history")}</span>
                </Button>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-1 mb-8 h-auto p-1 bg-[#faf7f3] dark:bg-slate-800 border border-[#e6dcd2] dark:border-slate-700 rounded-xl">
                <TabsTrigger
                  value="finder"
                  className="border border-[#e6dcd2] dark:border-slate-700 rounded-lg data-[state=active]:border-[#e6dcd2] data-[state=active]:bg-[#fffdfa] dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#bf6f4a] data-[state=active]:shadow-none text-[#9c9187] dark:text-slate-400 h-auto py-3 px-2 whitespace-normal text-center leading-tight font-medium data-[state=active]:font-semibold"
                >
                  <span className="block">
                    {t("nav.chord-finder").split(' ').map((word, i, arr) => (
                      <span key={i}>{word}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="reverse"
                  className="border border-[#e6dcd2] dark:border-slate-700 rounded-lg data-[state=active]:border-[#e6dcd2] data-[state=active]:bg-[#fffdfa] dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#6b8e70] data-[state=active]:shadow-none text-[#9c9187] dark:text-slate-400 h-auto py-3 px-2 whitespace-normal text-center leading-tight font-medium data-[state=active]:font-semibold"
                >
                  <span className="block">
                    {t("nav.reverse-lookup").split(' ').map((word, i, arr) => (
                      <span key={i}>{word}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="progression"
                  className="border border-[#e6dcd2] dark:border-slate-700 rounded-lg data-[state=active]:border-[#597399] data-[state=active]:bg-[#597399] data-[state=active]:text-white data-[state=active]:shadow-none text-[#9c9187] dark:text-slate-400 h-auto py-3 px-2 whitespace-normal text-center leading-tight font-medium data-[state=active]:font-semibold"
                >
                  <span className="block">
                    {t("nav.progression-builder").split(' ').map((word, i, arr) => (
                      <span key={i}>{word}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="finder" className="space-y-6">
                <ChordFinder onChordSelect={setSelectedChord} initialChord={selectedChord} />
              </TabsContent>

              <TabsContent value="reverse" forceMount className="space-y-6 data-[state=inactive]:hidden">
                <div className="p-3 sm:p-6">
                  <ChordFinderReverse onChordSelect={handleChordSelectFromLibrary} />
                </div>
              </TabsContent>

              <TabsContent value="progression" forceMount className="space-y-6 data-[state=inactive]:hidden">
                <div className="p-3 sm:p-6">
                  <ChordProgressionBuilder
                    onChordSelect={handleChordSelectFromLibrary}
                    externalProgression={pendingProgression}
                    onExternalProgressionConsumed={() => setPendingProgression(undefined)}
                    editingProgression={editingProgression}
                    onEditingProgressionConsumed={() => setEditingProgression(undefined)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Contextual sidebar — desktop only (lg+), varies with active tab, collapsible to a slim rail.
              The wrapper is a fixed 48px-wide sticky column so the main content's width never changes;
              the expanded panel is absolutely positioned inside it and overlaps the main content instead
              of pushing/shrinking it. */}
          {user && activeTab === "finder" && (
            <div className="hidden lg:block w-12 shrink-0 sticky top-28">
              {chordsSidebarCollapsed ? (
                <CollapsedSidebarRail
                  label={t("nav.my-chords")}
                  count={chordsCount}
                  accent={theme.accent}
                  onExpand={() => setChordsSidebarCollapsed(false)}
                />
              ) : (
                <aside className="absolute right-0 top-0 z-[60] flex flex-col w-72 xl:w-80 max-h-[calc(100vh-8rem)] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 z-10"
                    onClick={() => setChordsSidebarCollapsed(true)}
                    title={t("nav.my-chords")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <MyChordsPanel onChordSelect={handleChordSelectFromLibrary} onCountChange={setChordsCount} />
                </aside>
              )}
            </div>
          )}
          {user && activeTab === "progression" && (
            <div className="hidden lg:block w-12 shrink-0 sticky top-28">
              {progressionsSidebarCollapsed ? (
                <CollapsedSidebarRail
                  label={t("nav.my-progressions")}
                  count={progressionsCount}
                  accent={theme.accent}
                  onExpand={() => setProgressionsSidebarCollapsed(false)}
                />
              ) : (
                <aside className="absolute right-0 top-0 z-[60] flex flex-col w-72 xl:w-80 max-h-[calc(100vh-8rem)] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 z-10"
                    onClick={() => setProgressionsSidebarCollapsed(true)}
                    title={t("nav.my-progressions")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <MyProgressionsPanel onProgressionEdit={handleProgressionEdit} onCountChange={setProgressionsCount} />
                </aside>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
