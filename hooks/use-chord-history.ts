"use client"

import { useState, useEffect } from "react"

export interface ChordHistoryItem {
  chord: string
  timestamp: number
}

const STORAGE_KEY = "chord-history"
const MAX_HISTORY_ITEMS = 20

export function useChordHistory() {
  const [history, setHistory] = useState<ChordHistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed)
      }
    } catch (error) {
      console.error("Failed to load chord history:", error)
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error("Failed to save chord history:", error)
    }
  }, [history])

  const addToHistory = (chord: string) => {
    setHistory(prev => {
      // Remove existing entry for this chord
      const filtered = prev.filter(item => item.chord !== chord)
      
      // Add new entry at the beginning
      const newHistory = [
        { chord, timestamp: Date.now() },
        ...filtered
      ]
      
      // Keep only the most recent items
      return newHistory.slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const clearHistory = () => {
    setHistory([])
  }

  const removeFromHistory = (chord: string) => {
    setHistory(prev => prev.filter(item => item.chord !== chord))
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}