// Normalizes chord-name input into the compact symbol form the rest of the
// app treats as canonical (e.g. "C", "Cm", "Cmaj7", "Cm7") — the same style
// used by COMMON_CHORDS, NotePicker's quality/extension buttons, and every
// hardcoded example chord. Two things feed this:
//   1. Free-text typed into the Chord Finder search box, which may be
//      natural language ("C major", "C Minor", "c min7") rather than compact
//      notation.
//   2. Tonal's own Chord.detect() output, used by Reverse Lookup — for a
//      plain major triad it returns e.g. "CM" (bare capital M), which is
//      genuinely ambiguous with "Cm" (minor) to a human reader and, before
//      this normalizer existed, was also mis-parsed as minor by
//      chords-db-integration's suffix matching.
// Anything not recognized here is returned with only the root's case fixed,
// so already-compact/valid symbols (e.g. "Em#5/C") pass through unchanged.

const QUALITY_ALIASES: Record<string, string> = {
  "": "",
  major: "",
  maj: "",
  minor: "m",
  min: "m",
  majorseventh: "maj7",
  major7: "maj7",
  maj7: "maj7",
  minorseventh: "m7",
  minor7: "m7",
  min7: "m7",
  m7: "m7",
  dominantseventh: "7",
  dominant7: "7",
  dom7: "7",
  seventh: "7",
  "7": "7",
  diminished: "dim",
  dim: "dim",
  diminishedseventh: "dim7",
  dim7: "dim7",
  augmented: "aug",
  aug: "aug",
  suspended2: "sus2",
  sus2: "sus2",
  suspended4: "sus4",
  suspended: "sus4",
  sus4: "sus4",
  add9: "add9",
  add11: "add11",
  sixth: "6",
  "6": "6",
  ninth: "9",
  "9": "9",
  eleventh: "11",
  "11": "11",
  thirteenth: "13",
  "13": "13",
  minorninth: "m9",
  minor9: "m9",
  m9: "m9",
  majorninth: "maj9",
  major9: "maj9",
  maj9: "maj9",
}

export function normalizeChordInput(raw: string): string {
  const input = raw.trim()
  if (!input) return input

  const rootMatch = input.match(/^([A-Ga-g])\s*(#|b|sharp|flat)?/)
  if (!rootMatch) return input

  const accidentalWord = rootMatch[2]?.toLowerCase()
  const accidental = accidentalWord === "sharp" ? "#" : accidentalWord === "flat" ? "b" : accidentalWord ?? ""
  const root = rootMatch[1].toUpperCase() + accidental

  const rest = input.slice(rootMatch[0].length)
  const trimmedRest = rest.trim()

  // Case-sensitive special case, checked before any lowercasing: Tonal's own
  // compact ambiguous pair. Bare "M" = major, bare "m" = minor.
  if (trimmedRest === "M") return root
  if (trimmedRest === "m") return `${root}m`

  const key = trimmedRest.toLowerCase().replace(/\s+/g, "")
  const suffix = QUALITY_ALIASES[key]
  if (suffix !== undefined) return root + suffix

  return root + rest
}
