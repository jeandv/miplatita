import type { Currency } from '../types/finance'

// Monochrome (black & white) styling. Currencies are distinguished by their
// labels, not by hue, to keep the premium B&W identity consistent.
export const CURRENCY_ACCENT: Record<Currency, string> = {
  USD: 'border-app bg-app-accent-soft',
  VES: 'border-app bg-app-accent-soft',
  EUR: 'border-app bg-app-accent-soft',
  COP: 'border-app bg-app-accent-soft',
  MXN: 'border-app bg-app-accent-soft',
}

export const CURRENCY_AMOUNT_COLOR: Record<Currency, string> = {
  USD: 'text-app-fg',
  VES: 'text-app-fg',
  EUR: 'text-app-fg',
  COP: 'text-app-fg',
  MXN: 'text-app-fg',
}

export const CURRENCY_ORDER: Currency[] = ['USD', 'VES', 'EUR', 'COP', 'MXN']
