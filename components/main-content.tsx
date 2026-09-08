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
import MyChordsSimpleRail from "@/components/user-features/my-chords-simple-rail"
import MyProgressionsSimpleRail from "@/components/user-features/my-progressions-simple-rail"
import HistoryPanel from "@/components/user-features/history-panel"
import LibrarySheet from "@/components/user-features/library-sheet"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useFavoriteChords } from "@/hooks/use-favorite-chords"
import { useSavedProgressions } from "@/hooks/use-saved-progressions"
import type { EditableProgression } from "@/lib/user-data"
import { Clock, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { TAB_THEME as TAB_ACCENTS } from "@/lib/tab-theme"
import LogoMark from "@/components/logo-mark"

const TAB_THEME = {
  finder: {
    accent: TAB_ACCENTS.finder.accent,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.finder.accent} 50%, ${TAB_ACCENTS.finder.accentDark})`,
  },
  reverse: {
    accent: TAB_ACCENTS.reverse.accent,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.reverse.accent} 50%, ${TAB_ACCENTS.reverse.accentDark})`,
  },
  progression: {
    accent: TAB_ACCENTS.progression.accent,
    headingGradient: `linear-gradient(90deg, var(--heading-grad-start), ${TAB_ACCENTS.progression.accent} 50%, ${TAB_ACCENTS.progression.accentDark})`,
  },
} as const

// Persistent edge tab — stays visible whether its panel is collapsed or expanded.
// Figma: "Edge Tab - My Chords/My Progressions". Position:sticky + vertically
// centered (top-1/2 -translate-y-1/2) is applied by the parent wrapper, not here.
// `compact` shrinks it further for the mobile rail so it costs less width.
function EdgeTab({
  label,
  count,
  accent,
  tint,
  countStyle,
  isOpen,
  compact,
  onExpand,
}: {
  label: string
  count: number
  accent: string
  tint: string
  countStyle: "solid" | "tint"
  isOpen: boolean
  compact?: boolean
  onExpand: () => void
}) {
  const iconBoxClass = compact ? "h-6 w-6" : "h-9 w-9"
  const iconSizeClass = compact ? "h-3 w-3" : "h-[18px] w-[18px]"
  const chevronSizeClass = compact ? "h-3 w-3" : "h-4 w-4"
  const countBoxClass = compact ? "h-4 w-4 text-[8px]" : "h-[26px] w-[26px] text-[11px]"
  const labelClass = compact ? "text-[9px]" : "text-xs"
  const Chevron = isOpen ? ChevronRight : ChevronLeft

  return (
    <div className={`flex flex-col items-center justify-between rounded-2xl border border-[#e6dcd2] dark:border-slate-700 bg-[#f5f1eb] dark:bg-slate-900 shadow-sm ${compact ? "gap-2 py-2" : "gap-4 py-3"}`}>
      <div className={`${iconBoxClass} shrink-0 rounded-lg border border-[#e6dcd2] dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center`}>
        <Star className={iconSizeClass} style={{ color: accent }} />
      </div>
      <div className={`flex flex-col items-center ${compact ? "gap-1" : "gap-2"}`}>
        {count > 0 && (
          <span
            className={`flex items-center justify-center font-semibold rounded-full shrink-0 ${countBoxClass}`}
            style={
              countStyle === "solid"
                ? { backgroundColor: accent, color: "#fffdfa" }
                : { backgroundColor: tint, color: accent }
            }
          >
            {count}
          </span>
        )}
        <span
          className={`font-medium whitespace-nowrap text-[#37302a] dark:text-slate-200 ${labelClass}`}
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={onExpand}
        title={label}
        className={`${iconBoxClass} min-h-0 shrink-0 rounded-lg border border-[#e6dcd2] dark:border-slate-700 flex items-center justify-center`}
        style={{ backgroundColor: tint }}
      >
        <Chevron className={chevronSizeClass} style={{ color: accent }} />
      </button>
    </div>
  )
}

export default function MainContent() {
  const [selectedChord, setSelectedChord] = useState("C")
  const [activeTab, setActiveTab] = useState("finder")
  const theme = TAB_THEME[activeTab as keyof typeof TAB_THEME] ?? TAB_THEME.finder
  const [historySheetOpen, setHistorySheetOpen] = useState(false)
  const [pendingProgression, setPendingProgression] = useState<string[] | undefined>()
  const [editingProgression, setEditingProgression] = useState<EditableProgression | undefined>()
  // Desktop only ever uses "collapsed"/"full" (2-state). Mobile uses all three:
  // collapsed -> simple (thin name-only rail) -> full (same rich panel as desktop).
  const [chordsPanelView, setChordsPanelView] = useState<"collapsed" | "simple" | "full">("collapsed")
  const [progressionsPanelView, setProgressionsPanelView] = useState<"collapsed" | "simple" | "full">("collapsed")
  const { user } = useAuth()
  const { t } = useLanguage()
  // Owned here (not inside the panels) so favorites/progressions stay loaded
  // across simple <-> full transitions on mobile instead of re-fetching and
  // flashing empty every time either view mounts.
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavoriteChords(t)
  const { progressions, loading: progressionsLoading, deleteProgression, togglePublic } = useSavedProgressions(t)

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
      {/* Mobile bottom sheet — History only. My Chords/My Progressions use the
          persistent edge-tab panel below (same mechanism as desktop) instead
          of a full-screen modal takeover. */}
      {user && (
        <LibrarySheet open={historySheetOpen} onOpenChange={setHistorySheetOpen} title={t("nav.history")}>
          <HistoryPanel
            onChordSelect={(chord) => { handleChordSelectFromLibrary(chord); setHistorySheetOpen(false) }}
            onProgressionSelect={(chords) => { handleProgressionSelect(chords); setHistorySheetOpen(false) }}
          />
        </LibrarySheet>
      )}

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-3 lg:px-4">
          {/* Desktop Layout */}
          <div className="hidden sm:grid sm:grid-cols-3 items-center h-20 gap-4">
            <div></div>

            {/* Centered Logo/Title */}
            <div className="flex items-center justify-center space-x-3">
              <LogoMark className="w-12 h-12 shrink-0" />
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
              <LogoMark className="w-10 h-10 shrink-0" />
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

            {/* Mobile controls — always-visible history only when logged in.
                My Chords/My Progressions live in the edge-tab panel now, not here. */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
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

      <main className="max-w-[1400px] mx-auto px-2 sm:px-3 lg:px-4 py-8">
        <div className="flex lg:gap-6 items-start">
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

          {/* Contextual sidebar — desktop (lg+), varies with active tab. The wrapper is a fixed
              48px-wide column, position:sticky + vertically centered (floats in the middle of the
              viewport regardless of scroll) so the main content's width never changes. The edge tab
              stays visible at all times; the expanded panel is absolutely positioned flush to its
              left edge (right-full) so it overlaps the main content instead of pushing/shrinking it.
              Mobile has its own parallel block below (lg:hidden) with a thinner rail and an extra
              "simple" tier. */}
          {user && activeTab === "finder" && (
            <div className="hidden lg:block w-12 shrink-0 sticky top-1/2 -translate-y-1/2">
              <EdgeTab
                label={t("nav.my-chords")}
                count={favorites.length}
                accent={theme.accent}
                tint={TAB_ACCENTS.finder.tint}
                countStyle="solid"
                isOpen={chordsPanelView !== "collapsed"}
                onExpand={() => setChordsPanelView((v) => (v === "collapsed" ? "full" : "collapsed"))}
              />
              {chordsPanelView === "full" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-56 max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyChordsPanel
                    isSignedIn={!!user}
                    favorites={favorites}
                    loading={favoritesLoading}
                    onRemoveFavorite={removeFavorite}
                    onChordSelect={handleChordSelectFromLibrary}
                    onCollapse={() => setChordsPanelView("collapsed")}
                  />
                </aside>
              )}
            </div>
          )}
          {user && activeTab === "progression" && (
            <div className="hidden lg:block w-12 shrink-0 sticky top-1/2 -translate-y-1/2">
              <EdgeTab
                label={t("nav.my-progressions")}
                count={progressions.length}
                accent={theme.accent}
                tint={TAB_ACCENTS.progression.tint}
                countStyle="tint"
                isOpen={progressionsPanelView !== "collapsed"}
                onExpand={() => setProgressionsPanelView((v) => (v === "collapsed" ? "full" : "collapsed"))}
              />
              {progressionsPanelView === "full" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-56 max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyProgressionsPanel
                    isSignedIn={!!user}
                    progressions={progressions}
                    loading={progressionsLoading}
                    onDeleteProgression={deleteProgression}
                    onTogglePublic={togglePublic}
                    onProgressionEdit={handleProgressionEdit}
                    onCollapse={() => setProgressionsPanelView("collapsed")}
                  />
                </aside>
              )}
            </div>
          )}

          {/* Mobile equivalent (lg:hidden) — same edge-tab mechanism, but position:fixed instead
              of a sticky flex sibling: on a small screen every pixel of main-content width matters,
              so the rail costs the page ZERO layout width (unlike desktop, which can afford to
              reserve a column) and instead floats on top of the content, still centered in the
              viewport regardless of scroll. Also has an extra "simple" tier in between: collapsed
              -> simple (thin name-only rail, tap an item to load it) -> full (identical rich panel
              to desktop, reached via the expand icon inside the simple rail). */}
          {user && activeTab === "finder" && (
            <div className="lg:hidden fixed right-1 top-1/2 -translate-y-1/2 z-[60]">
              <EdgeTab
                label={t("nav.my-chords")}
                count={favorites.length}
                accent={theme.accent}
                tint={TAB_ACCENTS.finder.tint}
                countStyle="solid"
                compact
                isOpen={chordsPanelView !== "collapsed"}
                onExpand={() => setChordsPanelView((v) => (v === "collapsed" ? "simple" : "collapsed"))}
              />
              {chordsPanelView === "simple" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-fit min-w-[44px] max-w-[7rem] max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyChordsSimpleRail
                    isSignedIn={!!user}
                    favorites={favorites}
                    loading={favoritesLoading}
                    onChordSelect={handleChordSelectFromLibrary}
                    onExpand={() => setChordsPanelView("full")}
                  />
                </aside>
              )}
              {chordsPanelView === "full" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-56 max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyChordsPanel
                    isSignedIn={!!user}
                    favorites={favorites}
                    loading={favoritesLoading}
                    onRemoveFavorite={removeFavorite}
                    onChordSelect={handleChordSelectFromLibrary}
                    onCollapse={() => setChordsPanelView("simple")}
                  />
                </aside>
              )}
            </div>
          )}
          {user && activeTab === "progression" && (
            <div className="lg:hidden fixed right-1 top-1/2 -translate-y-1/2 z-[60]">
              <EdgeTab
                label={t("nav.my-progressions")}
                count={progressions.length}
                accent={theme.accent}
                tint={TAB_ACCENTS.progression.tint}
                countStyle="tint"
                compact
                isOpen={progressionsPanelView !== "collapsed"}
                onExpand={() => setProgressionsPanelView((v) => (v === "collapsed" ? "simple" : "collapsed"))}
              />
              {progressionsPanelView === "simple" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-32 max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyProgressionsSimpleRail
                    isSignedIn={!!user}
                    progressions={progressions}
                    loading={progressionsLoading}
                    onProgressionEdit={handleProgressionEdit}
                    onExpand={() => setProgressionsPanelView("full")}
                  />
                </aside>
              )}
              {progressionsPanelView === "full" && (
                <aside className="absolute right-full top-1/2 -translate-y-1/2 z-[60] flex flex-col w-56 max-h-[85vh] rounded-xl border bg-card shadow-lg overflow-hidden">
                  <MyProgressionsPanel
                    isSignedIn={!!user}
                    progressions={progressions}
                    loading={progressionsLoading}
                    onDeleteProgression={deleteProgression}
                    onTogglePublic={togglePublic}
                    onProgressionEdit={handleProgressionEdit}
                    onCollapse={() => setProgressionsPanelView("simple")}
                  />
                </aside>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
