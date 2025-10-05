"use client"

import { useLanguage } from "@/contexts/language-context"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setLanguage(language === "en" ? "zh" : "en")}
        className="group relative flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white"
        aria-label="Toggle language"
      >
        {/* Globe icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600 group-hover:text-gray-800 transition-colors"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>

        {/* Language text */}
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors min-w-[24px]">
          {language === "en" ? "EN" : "中文"}
        </span>

        {/* Subtle indicator */}
        <div className="w-1 h-1 rounded-full bg-cookie-500 opacity-60"></div>
      </button>
    </div>
  )
}
