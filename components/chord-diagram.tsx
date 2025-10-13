interface ChordPosition {
  string: number // 1-6 (high E to low E)
  fret: number // -1 for muted, 0 for open, 1+ for fretted
  finger?: number // 1-4 for finger number
}

interface ChordDiagramProps {
  positions: ChordPosition[]
  startFret?: number
}

export default function ChordDiagram({ positions, startFret = 1 }: ChordDiagramProps) {
  const fretCount = 5
  const stringCount = 6
  const stringSpacing = 25
  const fretHeight = 35
  const nutHeight = 4
  const width = stringSpacing * (stringCount - 1) + 60
  const height = fretHeight * fretCount + nutHeight + 80

  // Calculate actual start fret based on positions - fix for dots outside chart
  const frettedPositions = positions.filter((p) => p.fret > 0)
  const minFret = frettedPositions.length > 0 ? Math.min(...frettedPositions.map((p) => p.fret)) : 1
  const maxFret = frettedPositions.length > 0 ? Math.max(...frettedPositions.map((p) => p.fret)) : 1

  // Determine display start fret - ensure all frets fit within the 5-fret window
  let displayStartFret = 1
  if (minFret > 3) {
    displayStartFret = Math.max(1, minFret - 1)
  }

  // If the chord spans more than 5 frets, adjust to fit
  if (maxFret - displayStartFret >= fretCount) {
    displayStartFret = Math.max(1, maxFret - fretCount + 1)
  }

  // Get string X position (string 1 = high E on the right, string 6 = low E on the left)
  const getStringX = (string: number) => {
    return 30 + (6 - string) * stringSpacing
  }

  // Get fret Y position - fixed calculation to prevent dots outside chart
  const getFretY = (fret: number) => {
    if (fret === 0) return nutHeight + 20 // Open string position above nut

    // Ensure fret is within display range
    const relativeFret = fret - displayStartFret + 1
    if (relativeFret < 1 || relativeFret > fretCount) {
      console.warn(`Fret ${fret} is outside display range ${displayStartFret}-${displayStartFret + fretCount - 1}`)
      return nutHeight + 20 + fretHeight * 2.5 // Default to middle position
    }

    return nutHeight + 20 + relativeFret * fretHeight
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="chord-diagram">
        {/* Fret position indicator */}
        {displayStartFret > 1 && (
          <text x={10} y={nutHeight + 20 + fretHeight * 2.5} fontSize="12" textAnchor="middle" fill="#666">
            {displayStartFret}fr
          </text>
        )}

        {/* Nut (thick horizontal line at top for open position) */}
        {displayStartFret === 1 && (
          <rect x={30} y={nutHeight + 20 - 2} width={stringSpacing * (stringCount - 1)} height={4} fill="#333" />
        )}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={30}
            y1={nutHeight + 20 + i * fretHeight}
            x2={30 + stringSpacing * (stringCount - 1)}
            y2={nutHeight + 20 + i * fretHeight}
            stroke="#333"
            strokeWidth={i === 0 && displayStartFret > 1 ? "3" : "1"}
          />
        ))}

        {/* Strings (vertical lines) */}
        {Array.from({ length: stringCount }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={getStringX(i + 1)}
            y1={nutHeight + 20}
            x2={getStringX(i + 1)}
            y2={nutHeight + 20 + fretHeight * fretCount}
            stroke="#333"
            strokeWidth="1"
          />
        ))}

        {/* String labels (E A D G B E from left to right) */}
        {["E", "A", "D", "G", "B", "E"].map((note, i) => (
          <text
            key={`label-${i}`}
            x={getStringX(6 - i)}
            y={height - 10}
            fontSize="12"
            textAnchor="middle"
            fill="#666"
            fontWeight="bold"
          >
            {note}
          </text>
        ))}

        {/* Finger positions */}
        {positions.map((pos, index) => {
          const x = getStringX(pos.string)

          if (pos.fret === -1) {
            // Muted string (X)
            return (
              <g key={`muted-${index}`}>
                <text x={x} y={nutHeight + 10} fontSize="16" textAnchor="middle" fill="#666" fontWeight="bold">
                  ×
                </text>
              </g>
            )
          } else if (pos.fret === 0) {
            // Open string (O)
            return (
              <g key={`open-${index}`}>
                <circle cx={x} cy={nutHeight + 10} r="7" fill="none" stroke="#333" strokeWidth="2" />
              </g>
            )
          } else {
            // Fretted note - position between frets, only if within display range
            const relativeFret = pos.fret - displayStartFret + 1
            if (relativeFret >= 1 && relativeFret <= fretCount) {
              const fretY = nutHeight + 20 + (relativeFret - 0.5) * fretHeight
              return (
                <g key={`fretted-${index}`}>
                  <circle cx={x} cy={fretY} r="10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
                  {pos.finger && pos.finger > 0 && (
                    <text x={x} y={fretY + 4} fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">
                      {pos.finger}
                    </text>
                  )}
                </g>
              )
            }
            return null // Don't render if outside display range
          }
        })}

        {/* Fret numbers on both sides */}
        {Array.from({ length: fretCount }, (_, i) => {
          const fretNumber = displayStartFret + i
          return (
            <g key={`fret-numbers-${i}`}>
              {/* Left side fret numbers */}
              <text
                x={15}
                y={nutHeight + 20 + (i + 0.5) * fretHeight + 4}
                fontSize="10"
                textAnchor="middle"
                fill="#666"
                fontWeight="500"
              >
                {fretNumber}
              </text>
              {/* Right side fret numbers */}
              <text
                x={width - 15}
                y={nutHeight + 20 + (i + 0.5) * fretHeight + 4}
                fontSize="10"
                textAnchor="middle"
                fill="#666"
                fontWeight="500"
              >
                {fretNumber}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
