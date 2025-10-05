interface ChordPosition {
  string: number // 1-6 (high E to low E)
  fret: number // -1 for muted, 0 for open, 1+ for fretted
  finger?: number // 1-4 for finger number
}

interface MiniChordDiagramProps {
  positions: ChordPosition[]
  startFret?: number
}

export default function MiniChordDiagram({ positions, startFret = 1 }: MiniChordDiagramProps) {
  const fretCount = 4
  const stringCount = 6
  const stringSpacing = 15
  const fretHeight = 20
  const nutHeight = 2
  const width = stringSpacing * (stringCount - 1) + 40
  const height = fretHeight * fretCount + nutHeight + 50

  // Calculate actual start fret based on positions - fix for dots outside chart
  const frettedPositions = positions.filter((p) => p.fret > 0)
  const minFret = frettedPositions.length > 0 ? Math.min(...frettedPositions.map((p) => p.fret)) : 1
  const maxFret = frettedPositions.length > 0 ? Math.max(...frettedPositions.map((p) => p.fret)) : 1

  // Determine display start fret - ensure all frets fit within the 4-fret window
  let displayStartFret = 1
  if (minFret > 3) {
    displayStartFret = Math.max(1, minFret - 1)
  }

  // If the chord spans more than 4 frets, adjust to fit
  if (maxFret - displayStartFret >= fretCount) {
    displayStartFret = Math.max(1, maxFret - fretCount + 1)
  }

  // Get string X position (string 1 = high E on the right, string 6 = low E on the left)
  const getStringX = (string: number) => {
    return 20 + (6 - string) * stringSpacing
  }

  // Get fret Y position - fixed calculation to prevent dots outside chart
  const getFretY = (fret: number) => {
    if (fret === 0) return nutHeight + 15 // Open string position above nut

    // Ensure fret is within display range
    const relativeFret = fret - displayStartFret + 1
    if (relativeFret < 1 || relativeFret > fretCount) {
      console.warn(
        `Mini diagram: Fret ${fret} is outside display range ${displayStartFret}-${displayStartFret + fretCount - 1}`,
      )
      return nutHeight + 15 + fretHeight * 2 // Default to middle position
    }

    return nutHeight + 15 + relativeFret * fretHeight
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="mini-chord-diagram">
        {/* Fret position indicator */}
        {displayStartFret > 1 && (
          <text x={5} y={nutHeight + 15 + fretHeight * 2} fontSize="8" textAnchor="middle" fill="#666">
            {displayStartFret}
          </text>
        )}

        {/* Nut (thick horizontal line at top for open position) */}
        {displayStartFret === 1 && (
          <rect x={20} y={nutHeight + 15 - 1} width={stringSpacing * (stringCount - 1)} height={2} fill="#333" />
        )}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={20}
            y1={nutHeight + 15 + i * fretHeight}
            x2={20 + stringSpacing * (stringCount - 1)}
            y2={nutHeight + 15 + i * fretHeight}
            stroke="#333"
            strokeWidth={i === 0 && displayStartFret > 1 ? "2" : "0.5"}
          />
        ))}

        {/* Strings (vertical lines) */}
        {Array.from({ length: stringCount }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={getStringX(i + 1)}
            y1={nutHeight + 15}
            x2={getStringX(i + 1)}
            y2={nutHeight + 15 + fretHeight * fretCount}
            stroke="#333"
            strokeWidth="0.5"
          />
        ))}

        {/* Finger positions */}
        {positions.map((pos, index) => {
          const x = getStringX(pos.string)

          if (pos.fret === -1) {
            // Muted string (X) - smaller
            return (
              <g key={`muted-${index}`}>
                <text x={x} y={nutHeight + 8} fontSize="8" textAnchor="middle" fill="#666" fontWeight="bold">
                  ×
                </text>
              </g>
            )
          } else if (pos.fret === 0) {
            // Open string (O) - smaller
            return (
              <g key={`open-${index}`}>
                <circle cx={x} cy={nutHeight + 8} r="3" fill="none" stroke="#333" strokeWidth="1" />
              </g>
            )
          } else {
            // Fretted note - smaller dots, no finger numbers, only if within display range
            const relativeFret = pos.fret - displayStartFret + 1
            if (relativeFret >= 1 && relativeFret <= fretCount) {
              const fretY = nutHeight + 15 + (relativeFret - 0.5) * fretHeight
              return (
                <g key={`fretted-${index}`}>
                  <circle cx={x} cy={fretY} r="4" fill="#333" />
                </g>
              )
            }
            return null // Don't render if outside display range
          }
        })}
      </svg>
    </div>
  )
}
