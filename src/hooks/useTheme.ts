import { useCallback, useState } from 'react'
import { applyTheme, loadTheme, saveTheme, type Theme } from '../lib/settings'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      saveTheme(next)
      applyTheme(next)
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
