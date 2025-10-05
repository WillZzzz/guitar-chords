"use client"

import { useEffect } from "react"
import MainContent from "@/components/main-content"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { initializeHybridAudio } from "@/lib/audio-utils-hybrid"

export default function Home() {
  useEffect(() => {
    // Initialize audio for iOS compatibility on mount
    initializeHybridAudio()
  }, [])

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <MainContent />
          <Toaster position="top-center" richColors closeButton duration={3000} />
        </div>
      </AuthProvider>
    </LanguageProvider>
  )
}
