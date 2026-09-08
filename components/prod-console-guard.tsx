"use client"

import { useEffect } from "react"

// Silences console.log/debug noise for real visitors in production, while
// leaving console.error/warn intact and leaving `npm run dev` untouched —
// several lib/ modules log verbosely for iOS audio-compatibility debugging.
export default function ProdConsoleGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.log = () => {}
      console.debug = () => {}
    }
  }, [])

  return null
}
