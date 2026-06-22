import { useState } from 'react'
import type { Account, Currency } from '../types/finance'
import { CURRENCY_LABELS } from '../types/finance'
import {
  computeAccountBalance,
  useCreateAccount,
  useDeleteAccount,
  useTransactions,
  useUpdateAccount,
} from '../hooks/useFinance'
import { parseDecimal, sanitizeDecimalInput } from '../lib/decimal'
import { Button } from './Button'
import { FormScreen } from './FormScreen'
import { InputField, SelectField } from './FormFields'

interface AccountFormProps {
  onClose: () => void
  account?: Account | null
}

export function AccountForm({ onClose, account }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const transactions = useTransactions()
  const isEditing = !!account

  const [name, setName] = useState(account?.name ?? '')
  const [currency, setCurrency] = useState<Currency>(account?.currency ?? 'USD')
  const [balance, setBalance] = useState(
    account ? String(computeAccountBalance(account, transactions)) : '',
  )
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseDecimal(balance)

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
        { onSuccess: onClose, onError },
      )
    } else {
      if (amount < 0) {
        setError('Ingresa un monto válido')
        return
      }
      createAccount.mutate(
        { name: name.trim(), currency, initialBalance: amount },
        { onSuccess: onClose, onError },
      )
    }
  }

  function handleDelete() {
    if (!account) return
    deleteAccount.mutate(account.id, {
      onSuccess: onClose,
      onError: () => setError('No se pudo eliminar la cuenta. Intenta de nuevo.'),
    })
  }

  const isPending =
    createAccount.isPending || updateAccount.isPending || deleteAccount.isPending

  return (
    <FormScreen title={isEditing ? 'Editar cuenta' : 'Nueva cuenta'} onBack={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Nombre de la cuenta"
          placeholder="Ej: Banco Nacional, Efectivo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={balance}
          onChange={(e) => setBalance(sanitizeDecimalInput(e.target.value))}
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

        {isEditing && (
          <div className="pt-2">
            {!confirmingDelete ? (
              <Button
                type="button"
                variant="danger"
                fullWidth
                onClick={() => setConfirmingDelete(true)}
                disabled={isPending}
              >
                Eliminar cuenta
              </Button>
            ) : (
              <div className="space-y-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-sm text-app-fg">
                  ¿Seguro? Se eliminará la cuenta{' '}
                  <span className="font-semibold">y todos sus movimientos</span>.
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => setConfirmingDelete(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    fullWidth
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {deleteAccount.isPending ? 'Eliminando...' : 'Sí, eliminar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </FormScreen>
  )
}
