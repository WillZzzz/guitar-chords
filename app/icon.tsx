import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

// Matches components/logo-mark.tsx ("G7 Logo", Figma node 94:86).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffdfa",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 52 61.18" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.95" y="0.95" width="50.1" height="59.28" fill="#fffdfa" stroke="#37302a" strokeWidth="1.91" />
          <rect x="6.12" y="10.71" width="39.76" height="3.06" rx="1" fill="#37302a" />
          <rect x="6.65" y="29.06" width="38.71" height="1" fill="#37302a" />
          <rect x="6.65" y="43.59" width="38.71" height="1" fill="#37302a" />
          <rect x="6.65" y="58.12" width="38.71" height="1" fill="#37302a" />
          <rect x="7.04" y="14.53" width="1.22" height="43.59" fill="#37302a" />
          <rect x="14.42" y="14.53" width="1.13" height="43.59" fill="#37302a" />
          <rect x="21.81" y="14.53" width="1.04" height="43.59" fill="#37302a" />
          <rect x="29.2" y="14.53" width="0.95" height="43.59" fill="#37302a" />
          <rect x="36.58" y="14.53" width="0.86" height="43.59" fill="#37302a" />
          <rect x="43.95" y="14.53" width="0.8" height="43.59" fill="#37302a" />
          <circle cx="7.65" cy="50.86" r="4.21" fill="#bf6f4a" />
          <circle cx="14.99" cy="36.32" r="4.21" fill="#bf6f4a" />
          <circle cx="44.35" cy="21.79" r="4.21" fill="#bf6f4a" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
