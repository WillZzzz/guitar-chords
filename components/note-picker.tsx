'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Keyboard, X } from 'lucide-react'
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

  // Note categories
  const noteButtons = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const accidentalButtons = ['#', 'b', '/']
  const qualityButtons = ['m', '7', 'maj7', 'm7', 'dim', 'aug', 'sus2', 'sus4']
  const extensionButtons = ['add9', '9', '11', '13', '6', 'add11', 'm9', 'maj9']

  const handleButtonClick = (text: string) => {
    onChange(value + text)
  }

  const handleClear = () => {
    onChange('')
  }

  const handleKeyboardToggle = () => {
    setShowKeyboard(!showKeyboard)
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
            <div className="min-h-10 flex items-center px-3 border rounded-md bg-background text-foreground">
              {value || (
                <span className="text-muted-foreground text-sm">
                  {placeholder || t('chord-finder.search-placeholder')}
                </span>
              )}
            </div>
          )}
          
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
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
        <div className="space-y-4">
          {/* Notes and Accidentals Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('note-picker.notes')}:
              </span>
              <div className="flex gap-1 sm:gap-2">
                {noteButtons.map((note) => (
                  <Button
                    key={note}
                    variant="outline"
                    size="sm"
                    onClick={() => handleButtonClick(note)}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 font-medium"
                  >
                    {note}
                  </Button>
                ))}
              </div>
              
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('note-picker.accidentals')}:
              </span>
              <div className="flex gap-1 sm:gap-2">
                {accidentalButtons.map((symbol) => (
                  <Button
                    key={symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => handleButtonClick(symbol)}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 font-medium text-blue-600"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Buttons Section */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('note-picker.qualities')}:
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {qualityButtons.map((quality) => (
                <Button
                  key={quality}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(quality)}
                  className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm font-medium text-purple-600"
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>

          {/* Extension Buttons Section */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('note-picker.extensions')}:
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {extensionButtons.map((extension) => (
                <Button
                  key={extension}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(extension)}
                  className="h-8 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm font-medium text-orange-600"
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