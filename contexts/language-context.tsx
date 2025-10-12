"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getTranslations, getNestedTranslation, type Language, type Translations } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [translations, setTranslations] = useState<Translations>({})

  // Load language preference from localStorage
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("chord-theory-language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "zh")) {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.log("Could not load language preference")
    }
  }, [])

  // Load translations when language changes
  useEffect(() => {
    const loadedTranslations = getTranslations(language)
    setTranslations(loadedTranslations)
  }, [language])

  // Save language preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("chord-theory-language", language)
    } catch (error) {
      console.log("Could not save language preference")
    }
  }, [language])

  const t = (key: string, params?: Record<string, string>) => {
    try {
      return getNestedTranslation(translations, key, params)
    } catch (error) {
      console.log("Translation error for key:", key)
      return key
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}