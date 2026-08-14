import type { Locale, Dictionary } from '@/types'

export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en', 'de']
export const DEFAULT_LOCALE: Locale = 'tr'

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const lang = navigator.language.split('-')[0] as Locale
  return SUPPORTED_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE
}

const cache = new Map<Locale, Dictionary>()

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (cache.has(locale)) return cache.get(locale)!
  const dict = (await import(`./dictionaries/${locale}.json`)) as {
    default: Dictionary
  }
  cache.set(locale, dict.default)
  return dict.default
}

// Sunucu tarafı locale tespiti — Accept-Language header'ından.
// (app/e/[slug]/page.tsx içindeki yerel kopyanın paylaşılabilir hâli;
//  o dosya bilerek değiştirilmiyor.)
export function detectLocaleFromAcceptLanguage(acceptLang: string): Locale {
  const primary = acceptLang.split(',')[0].split(';')[0].trim().split('-')[0].toLowerCase()
  return SUPPORTED_LOCALES.includes(primary as Locale) ? (primary as Locale) : DEFAULT_LOCALE
}
