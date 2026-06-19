import { useCallback, useState } from 'react'
import { loadAmountsHidden, saveAmountsHidden } from '../lib/settings'

export function usePrivacy() {
  const [amountsHidden, setAmountsHidden] = useState(loadAmountsHidden)

  const toggleAmountsHidden = useCallback(() => {
    setAmountsHidden((prev) => {
      const next = !prev
      saveAmountsHidden(next)
      return next
    })
  }, [])

  return { amountsHidden, toggleAmountsHidden }
}
