'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Keyboard, X, Delete } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface NotePickerProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}

export default function NotePicker({ value, onChange, onSearch, placeholder }: NotePickerProps) {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const { t } = useLanguage()

  // Comprehensive note categories optimized for mobile
  const noteButtons = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const accidentalButtons = ['#', 'b', '/', 'ø']
  const qualityButtons = ['m', '7', 'maj7', 'm7', 'dim', 'aug', 'sus2', 'sus4']
  const extensionButtons = ['9', '11', '13', '6', 'add9', 'add11', 'm9', 'maj9']

  const handleButtonClick = (text: string) => {
    onChange(value + text)
  }

  const handleClear = () => {
    onChange('')
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const handleKeyboardToggle = () => {
    setShowKeyboard(!showKeyboard)
  }

  const handleDisplayClick = () => {
    setShowKeyboard(true)
  }

  return (
    <div className="w-full space-y-3">
      {/* Current Input Display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          {showKeyboard ? (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder={placeholder}
              className="pr-8"
              autoFocus
            />
          ) : (
            <div 
              className="min-h-10 flex items-center px-3 border rounded-md bg-background text-foreground cursor-text hover:bg-muted/50 transition-colors"
              onClick={handleDisplayClick}
            >
              {value || (
                <span className="text-muted-foreground text-sm">
                  {placeholder || t('chord-finder.search-placeholder')}
                </span>
              )}
            </div>
          )}
          
          {value && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackspace}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                title="Backspace"
              >
                <Delete className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0"
                title="Clear all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleKeyboardToggle}
          className="flex items-center gap-2"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">
            {showKeyboard ? t('ui.hide-keyboard') : t('ui.show-keyboard')}
          </span>
        </Button>
        
        <Button onClick={onSearch} className="bg-green-600 hover:bg-green-700">
          {t("ui.search")}
        </Button>
      </div>

      {/* Note Picker Buttons - Only show when keyboard is hidden */}
      {!showKeyboard && (
        <div className="space-y-3">
          {/* Notes and Accidentals - Combined Row */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0">
                {t('note-picker.notes')}:
              </span>
              <div className="flex flex-wrap gap-1">
                {noteButtons.map((note) => (
                  <Button
                    key={note}
                    variant="outline"
                    size="sm"
                    onClick={() => handleButtonClick(note)}
                    className="h-7 w-7 p-0 text-xs font-medium"
                  >
                    {note}
                  </Button>
                ))}
                {accidentalButtons.map((symbol) => (
                  <Button
                    key={symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => handleButtonClick(symbol)}
                    className="h-7 w-7 p-0 text-xs font-medium text-blue-600"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality and Extension Buttons - Combined */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('note-picker.qualities')} & {t('note-picker.extensions')}:
            </span>
            <div className="flex flex-wrap gap-1">
              {qualityButtons.map((quality) => (
                <Button
                  key={quality}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(quality)}
                  className="h-7 px-2 text-xs font-medium text-purple-600"
                >
                  {quality}
                </Button>
              ))}
              {extensionButtons.map((extension) => (
                <Button
                  key={extension}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(extension)}
                  className="h-7 px-2 text-xs font-medium text-orange-600"
                >
                  {extension}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}