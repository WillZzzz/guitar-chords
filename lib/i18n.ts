import enTranslations from './locales/en.json'
import zhTranslations from './locales/zh.json'

export type Language = 'en' | 'zh'

export interface Translations {
  [key: string]: any
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  zh: zhTranslations
}

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en
}

export function getNestedTranslation(
  translations: Translations, 
  key: string, 
  params?: Record<string, string>
): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to English if key not found
      value = getNestedTranslation(getTranslations('en'), key)
      break
    }
  }
  
  if (typeof value !== 'string') {
    return key // Return key if translation not found
  }
  
  // Replace parameters in translation
  if (params) {
    Object.entries(params).forEach(([param, replacement]) => {
      value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement)
    })
  }
  
  return value
}