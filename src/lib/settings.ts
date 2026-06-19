export type Theme = 'light' | 'dark'

const THEME_KEY = 'miplatita-theme'
const AMOUNTS_HIDDEN_KEY = 'miplatita-hide-amounts'

export function loadTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function loadAmountsHidden(): boolean {
  try {
    return localStorage.getItem(AMOUNTS_HIDDEN_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveAmountsHidden(hidden: boolean): void {
  localStorage.setItem(AMOUNTS_HIDDEN_KEY, String(hidden))
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0f172a')
}

export function maskAmount(hidden: boolean): string {
  return hidden ? '••••••' : ''
}
