import { useEffect, useRef, useState } from 'react'
import type { Account, Currency } from '../types/finance'
import { CURRENCY_LABELS } from '../types/finance'
import {
  computeAccountBalance,
  useCreateAccount,
  useTransactions,
  useUpdateAccount,
} from '../hooks/useFinance'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { InputField, SelectField } from './FormFields'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  account?: Account | null
}

export function AccountForm({ open, onClose, account }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const transactions = useTransactions()
  const isEditing = !!account
  const wasOpen = useRef(false)

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [balance, setBalance] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && !wasOpen.current) {
      if (account) {
        setName(account.name)
        setCurrency(account.currency)
        setBalance(String(computeAccountBalance(account, transactions)))
      } else {
        setName('')
        setCurrency('USD')
        setBalance('')
      }
      setError('')
    }
    wasOpen.current = open
  }, [open, account, transactions])

  function handleClose() {
    setError('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(balance)

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (isNaN(amount)) {
      setError('Ingresa un monto válido')
      return
    }

    const onError = () => setError('No se pudo guardar. Intenta de nuevo.')

    if (isEditing && account) {
      updateAccount.mutate(
        { id: account.id, name: name.trim(), currency, balance: amount },
        { onSuccess: handleClose, onError },
      )
    } else {
      if (amount < 0) {
        setError('Ingresa un monto válido')
        return
      }
      createAccount.mutate(
        { name: name.trim(), currency, initialBalance: amount },
        { onSuccess: handleClose, onError },
      )
    }
  }

  const isPending = createAccount.isPending || updateAccount.isPending

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Editar cuenta' : 'Nueva cuenta'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Nombre de la cuenta"
          placeholder="Ej: Banco Nacional, Efectivo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <SelectField
          label="Moneda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
        >
          {(Object.keys(CURRENCY_LABELS) as Currency[]).map((c) => (
            <option key={c} value={c}>
              {CURRENCY_LABELS[c]}
            </option>
          ))}
        </SelectField>
        <InputField
          label={isEditing ? 'Saldo actual' : 'Saldo inicial'}
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        {isEditing && (
          <p className="text-xs text-app-subtle">
            Al cambiar el saldo se ajustará automáticamente según tus movimientos.
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth size="lg" disabled={isPending}>
          {isPending
            ? 'Guardando...'
            : isEditing
              ? 'Guardar cambios'
              : 'Crear cuenta'}
        </Button>
      </form>
    </BottomSheet>
  )
}
