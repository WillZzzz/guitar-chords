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
  const stringSpacing = 20
  const fretHeight = 26
  const nutHeight = 4
  const margin = 22
  const topOffset = nutHeight + 14
  const bottomLabelSpace = 20
  const width = stringSpacing * (stringCount - 1) + margin * 2
  const height = topOffset + fretHeight * fretCount + bottomLabelSpace

  // Calculate actual start fret based on positions - fix for dots outside chart
  const frettedPositions = positions.filter((p) => p.fret > 0)
  const minFret = frettedPositions.length > 0 ? Math.min(...frettedPositions.map((p) => p.fret)) : 1
  const maxFret = frettedPositions.length > 0 ? Math.max(...frettedPositions.map((p) => p.fret)) : 1

  // Use the provided startFret prop, or calculate if not provided
  let displayStartFret = startFret || 1
  
  // Only calculate displayStartFret if startFret wasn't provided
  if (!startFret) {
    if (minFret > 3) {
      displayStartFret = Math.max(1, minFret - 1)
    }

    // If the chord spans more than 5 frets, adjust to fit
    if (maxFret - displayStartFret >= fretCount) {
      displayStartFret = Math.max(1, maxFret - fretCount + 1)
    }
  }

  // Get string X position (string 1 = high E on the right, string 6 = low E on the left)
  const getStringX = (string: number) => {
    return margin + (6 - string) * stringSpacing
  }

  // Get fret Y position - fixed calculation to prevent dots outside chart
  const getFretY = (fret: number) => {
    if (fret === 0) return topOffset // Open string position above nut

    // Ensure fret is within display range
    const relativeFret = fret - displayStartFret + 1
    if (relativeFret < 1 || relativeFret > fretCount) {
      console.warn(`Fret ${fret} is outside display range ${displayStartFret}-${displayStartFret + fretCount - 1}`)
      return topOffset + fretHeight * 2.5 // Default to middle position
    }

    return topOffset + relativeFret * fretHeight
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="chord-diagram">

        {/* Nut (thick horizontal line at top for open position) */}
        {displayStartFret === 1 && (
          <rect x={margin} y={topOffset - 2} width={stringSpacing * (stringCount - 1)} height={4} fill="#333" />
        )}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={margin}
            y1={topOffset + i * fretHeight}
            x2={margin + stringSpacing * (stringCount - 1)}
            y2={topOffset + i * fretHeight}
            stroke="#333"
            strokeWidth={i === 0 && displayStartFret > 1 ? "3" : "1"}
          />
        ))}

        {/* Strings (vertical lines) */}
        {Array.from({ length: stringCount }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={getStringX(i + 1)}
            y1={topOffset}
            x2={getStringX(i + 1)}
            y2={topOffset + fretHeight * fretCount}
            stroke="#333"
            strokeWidth="1"
          />
        ))}

        {/* String labels (E A D G B E from left to right) */}
        {["E", "A", "D", "G", "B", "E"].map((note, i) => (
          <text
            key={`label-${i}`}
            x={getStringX(6 - i)}
            y={height - 6}
            fontSize="11"
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
                <text x={x} y={topOffset - 6} fontSize="14" textAnchor="middle" fill="#666" fontWeight="bold">
                  ×
                </text>
              </g>
            )
          } else if (pos.fret === 0) {
            // Open string (O)
            return (
              <g key={`open-${index}`}>
                <circle cx={x} cy={topOffset - 6} r="6" fill="none" stroke="#333" strokeWidth="2" />
              </g>
            )
          } else {
            // Fretted note - position between frets
            const relativeFret = pos.fret - displayStartFret + 1

            // Always render fingering positions if they are within reasonable range
            // The display window should accommodate the actual chord data
            if (relativeFret >= 1 && relativeFret <= fretCount) {
              const fretY = topOffset + (relativeFret - 0.5) * fretHeight
              return (
                <g key={`fretted-${index}`}>
                  <circle cx={x} cy={fretY} r="8.5" fill="#bf6f4a" stroke="#a05537" strokeWidth="2" />
                  {pos.finger && pos.finger > 0 && (
                    <text x={x} y={fretY + 4} fontSize="11" textAnchor="middle" fill="white" fontWeight="bold">
                      {pos.finger}
                    </text>
                  )}
                </g>
              )
            } else {
              return null
            }
          }
        })}

        {/* Fret numbers on both sides */}
        {Array.from({ length: fretCount }, (_, i) => {
          const fretNumber = displayStartFret + i
          return (
            <g key={`fret-numbers-${i}`}>
              {/* Left side fret numbers */}
              <text
                x={margin / 2}
                y={topOffset + (i + 0.5) * fretHeight + 4}
                fontSize="10"
                textAnchor="middle"
                fill="#666"
                fontWeight="500"
              >
                {fretNumber}
              </text>
              {/* Right side fret numbers */}
              <text
                x={width - margin / 2}
                y={topOffset + (i + 0.5) * fretHeight + 4}
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
