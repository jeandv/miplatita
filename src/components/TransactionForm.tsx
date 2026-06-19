import { useEffect, useState } from 'react'
import type { Category, Transaction, TransactionType } from '../types/finance'
import { getCategoriesForType } from '../lib/categories'
import { toDateInputValue } from '../lib/date'
import {
  useAccounts,
  useCreateCustomCategory,
  useCreateTransaction,
  useCustomCategories,
  useDeleteTransaction,
  useUpdateTransaction,
} from '../hooks/useFinance'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { InputField, SelectField, TextAreaField } from './FormFields'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  defaultType?: TransactionType
  transaction?: Transaction | null
}

export function TransactionForm({
  open,
  onClose,
  defaultType = 'expense',
  transaction,
}: TransactionFormProps) {
  const accounts = useAccounts()
  const customCategories = useCustomCategories()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const createCustomCategory = useCreateCustomCategory()

  const isEditing = !!transaction

  const [type, setType] = useState<TransactionType>(defaultType)
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(
    defaultType === 'income' ? 'salary' : 'food',
  )
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [error, setError] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type)
      setAccountId(transaction.accountId)
      setAmount(String(transaction.amount))
      setDescription(transaction.description)
      setCategory(transaction.category)
      setDate(toDateInputValue(new Date(transaction.date)))
      setShowNewCategory(false)
      setNewCategoryName('')
      setError('')
    } else if (open && !transaction) {
      setType(defaultType)
      setAccountId(accounts[0]?.id ?? '')
      setAmount('')
      setDescription('')
      setCategory(defaultType === 'income' ? 'salary' : 'food')
      setDate(toDateInputValue(new Date()))
      setShowNewCategory(false)
      setNewCategoryName('')
      setError('')
    }
  }, [open, transaction, defaultType, accounts])

  function handleClose() {
    setError('')
    onClose()
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType)
    const cats = getCategoriesForType(newType, customCategories)
    setCategory(cats[0]?.id ?? (newType === 'income' ? 'salary' : 'food'))
  }

  function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      setError('Ingresa un nombre para la categoría')
      return
    }
    createCustomCategory.mutate(
      { name: newCategoryName.trim(), type },
      {
        onSuccess: (result) => {
          const newCat = result.customCategories.at(-1)
          if (newCat) setCategory(newCat.id)
          setShowNewCategory(false)
          setNewCategoryName('')
          setError('')
        },
        onError: () => setError('No se pudo crear la categoría'),
      },
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)

    if (!accountId) {
      setError('Selecciona una cuenta')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0')
      return
    }
    if (!description.trim()) {
      setError('Agrega una descripción')
      return
    }

    const payload = {
      accountId,
      type,
      amount: parsedAmount,
      description: description.trim(),
      category,
      date,
    }

    const onError = () => setError('No se pudo guardar. Intenta de nuevo.')

    if (isEditing && transaction) {
      updateTransaction.mutate(
        { id: transaction.id, ...payload },
        { onSuccess: handleClose, onError },
      )
    } else {
      createTransaction.mutate(payload, { onSuccess: handleClose, onError })
    }
  }

  function handleDelete() {
    if (!transaction) return
    deleteTransaction.mutate(transaction.id, { onSuccess: handleClose })
  }

  const categories = getCategoriesForType(type, customCategories)
  const isPending =
    createTransaction.isPending ||
    updateTransaction.isPending ||
    deleteTransaction.isPending

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={
        isEditing
          ? type === 'income'
            ? 'Editar ingreso'
            : 'Editar gasto'
          : type === 'income'
            ? 'Nuevo ingreso'
            : 'Nuevo gasto'
      }
    >
      {accounts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-app-muted">
            Primero crea una cuenta para registrar movimientos
          </p>
          <Button variant="secondary" className="mt-4" onClick={handleClose}>
            Entendido
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-app-elevated p-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={[
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400 shadow-sm'
                  : 'text-app-muted hover:text-app-fg',
              ].join(' ')}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={[
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                  : 'text-app-muted hover:text-app-fg',
              ].join(' ')}
            >
              Ingreso
            </button>
          </div>

          <SelectField
            label="Cuenta"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="" disabled>
              Selecciona una cuenta
            </option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </SelectField>

          <InputField
            label="Monto"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextAreaField
            label="Descripción"
            placeholder="Ej: Almuerzo, pago de luz..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-2">
            <SelectField
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </SelectField>
            {!showNewCategory ? (
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                + Crear nueva categoría
              </button>
            ) : (
              <div className="flex gap-2">
                <InputField
                  label=""
                  placeholder="Nombre de categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <div className="flex flex-col justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={createCustomCategory.isPending}
                  >
                    Crear
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <InputField
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" fullWidth size="lg" disabled={isPending}>
            {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar'}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={handleDelete}
              disabled={isPending}
            >
              Eliminar movimiento
            </Button>
          )}
        </form>
      )}
    </BottomSheet>
  )
}
