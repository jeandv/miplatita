import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePersistence, useAuth } from '../contexts/AuthProvider'
import { hasLocalData, clearFinanceData, loadFinanceData } from '../lib/storage'
import { financeKeys } from '../lib/query-keys'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'

export function ImportDialog() {
  const { isAuthenticated } = useAuth()
  const strategy = usePersistence()
  const queryClient = useQueryClient()
  const [show, setShow] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({ accounts: 0, transactions: 0 })

  useEffect(() => {
    if (isAuthenticated && hasLocalData()) {
      const data = loadFinanceData()
      setSummary({
        accounts: data.accounts.length,
        transactions: data.transactions.length,
      })
      setShow(true)
    }
  }, [isAuthenticated])

  async function handleImport() {
    setImporting(true)
    setError('')
    try {
      const data = loadFinanceData()
      await strategy.importData(data)
      clearFinanceData()
      await queryClient.invalidateQueries({ queryKey: financeKeys.all })
      setShow(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al importar los datos')
    } finally {
      setImporting(false)
    }
  }

  function handleSkip() {
    setShow(false)
  }

  return (
    <BottomSheet open={show} onClose={handleSkip} title="Datos locales encontrados">
      <p className="mb-4 text-sm text-app-muted">
        Encontramos datos guardados en este dispositivo. ¿Quieres importarlos a tu
        cuenta?
      </p>

      <div className="mb-5 flex gap-4 rounded-xl bg-app-elevated px-4 py-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-semibold text-emerald-400">
            {summary.accounts}
          </span>
          <span className="text-xs text-app-muted">
            {summary.accounts === 1 ? 'cuenta' : 'cuentas'}
          </span>
        </div>
        <div className="h-auto w-px bg-app-hover" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-semibold text-emerald-400">
            {summary.transactions}
          </span>
          <span className="text-xs text-app-muted">
            {summary.transactions === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={importing}
          onClick={handleImport}
        >
          {importing ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Importando...
            </>
          ) : (
            'Importar mis datos'
          )}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          disabled={importing}
          onClick={handleSkip}
        >
          No, empezar de cero
        </Button>
      </div>
    </BottomSheet>
  )
}
