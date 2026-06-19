import type { Currency } from '../types/finance'

export const CURRENCY_ACCENT: Record<Currency, string> = {
  USD: 'border-emerald-500/40 bg-emerald-500/10',
  VES: 'border-sky-500/40 bg-sky-500/10',
  EUR: 'border-violet-500/40 bg-violet-500/10',
  COP: 'border-amber-500/40 bg-amber-500/10',
  MXN: 'border-cyan-500/40 bg-cyan-500/10',
}

export const CURRENCY_AMOUNT_COLOR: Record<Currency, string> = {
  USD: 'text-emerald-400',
  VES: 'text-sky-400',
  EUR: 'text-violet-400',
  COP: 'text-amber-400',
  MXN: 'text-cyan-400',
}

export const CURRENCY_ORDER: Currency[] = ['USD', 'VES', 'EUR', 'COP', 'MXN']
