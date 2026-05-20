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
