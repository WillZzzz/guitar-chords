"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "zh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const translations = {
  en: {
    // Header
    "header.title": "Chord Theory",
    "header.subtitle": "Explore chord fingerings, understand music theory, and discover related chords.",

    // Navigation
    "nav.chord-finder": "Chord Finder",
    "nav.reverse-lookup": "Reverse Lookup",
    "nav.progression-builder": "Progression Builder",

    // Chord Finder
    "chord-finder.title": "Chord Finder",
    "chord-finder.description": "Select a root note and chord type to see fingerings and theory",
    "chord-finder.select-root": "Select Root Note",
    "chord-finder.select-type": "Select Chord Type",
    "chord-finder.search-placeholder": "Enter chord (e.g., C, Dm, G7, Amaj7)",
    "chord-finder.show-chord": "Show Chord",
    "chord-finder.popular-chords": "Popular Chords",
    "chord-finder.recent-searches": "Recent Searches",
    "chord-finder.clear": "Clear",
    "chord-finder.no-recent": "No recent searches",
    "chord-finder.enter-chord": "Enter a chord name above",
    "chord-finder.get-started": "Click any chord from the popular chords or enter your own chord name to get started",

    // Common
    "common.chord": "chord",
    "common.major": "Major",
    "common.minor": "Minor",
    "common.dominant-7th": "Dominant 7th",
    "common.major-7th": "Major 7th",
    "common.minor-7th": "Minor 7th",
    "common.suspended": "Suspended",
    "common.diminished": "Diminished",
    "common.augmented": "Augmented",
    "common.add9": "Add9",
    "common.power-chord": "Power Chord",
  },
  zh: {
    // Header
    "header.title": "和弦理论",
    "header.subtitle": "探索和弦指法，理解音乐理论，发现相关和弦。",

    // Navigation
    "nav.chord-finder": "和弦查找",
    "nav.reverse-lookup": "反向查找",
    "nav.progression-builder": "和弦进行构建器",

    // Chord Finder
    "chord-finder.title": "和弦查找器",
    "chord-finder.description": "选择根音和和弦类型来查看指法和理论",
    "chord-finder.select-root": "选择根音",
    "chord-finder.select-type": "选择和弦类型",
    "chord-finder.search-placeholder": "输入和弦 (例如: C, Dm, G7, Amaj7)",
    "chord-finder.show-chord": "显示和弦",
    "chord-finder.popular-chords": "热门和弦",
    "chord-finder.recent-searches": "最近搜索",
    "chord-finder.clear": "清除",
    "chord-finder.no-recent": "暂无最近搜索",
    "chord-finder.enter-chord": "在上方输入和弦名称",
    "chord-finder.get-started": "点击热门和弦或输入您自己的和弦名称开始使用",

    // Common
    "common.chord": "和弦",
    "common.major": "大调",
    "common.minor": "小调",
    "common.dominant-7th": "属七和弦",
    "common.major-7th": "大七和弦",
    "common.minor-7th": "小七和弦",
    "common.suspended": "挂留",
    "common.diminished": "减",
    "common.augmented": "增",
    "common.add9": "加九",
    "common.power-chord": "强力和弦",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

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
      let translation = translations[language]?.[key] || translations.en[key] || key

      // Replace parameters in translation
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, value)
        })
      }

      return translation
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
