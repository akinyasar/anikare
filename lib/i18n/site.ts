import type { Locale } from '@/types'

// Site-wide translations (nav, dashboard, shared UI)
const SITE_T = {
  tr: {
    // Nav
    features: 'Özellikler',
    howItWorks: 'Nasıl Çalışır',
    pricing: 'Fiyatlar',
    signIn: 'Giriş',
    startFree: 'Ücretsiz Başla',
    goToDashboard: 'Panele Git →',
    // Dashboard sidebar
    myEvents: 'Etkinliklerim',
    newEvent: 'Yeni Etkinlik',
    signOut: 'Çıkış Yap',
    // Shared
    language: 'Dil',
  },
  en: {
    features: 'Features',
    howItWorks: 'How It Works',
    pricing: 'Pricing',
    signIn: 'Sign In',
    startFree: 'Start Free',
    goToDashboard: 'Dashboard →',
    myEvents: 'My Events',
    newEvent: 'New Event',
    signOut: 'Sign Out',
    language: 'Language',
  },
  de: {
    features: 'Funktionen',
    howItWorks: 'Wie es funktioniert',
    pricing: 'Preise',
    signIn: 'Anmelden',
    startFree: 'Kostenlos starten',
    goToDashboard: 'Zum Dashboard →',
    myEvents: 'Meine Events',
    newEvent: 'Neue Veranstaltung',
    signOut: 'Abmelden',
    language: 'Sprache',
  },
} as const

export type SiteKey = keyof typeof SITE_T['tr']

export function t(locale: Locale, key: SiteKey): string {
  return (SITE_T[locale] as Record<string, string>)?.[key] ?? (SITE_T.tr as Record<string, string>)[key]
}
