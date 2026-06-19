import type {
  BuiltInCategory,
  Category,
  CustomCategory,
  TransactionType,
} from '../types/finance'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CUSTOM_CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../types/finance'

export function getCategoryLabel(
  categoryId: Category,
  customCategories: CustomCategory[],
): string {
  if (categoryId in CATEGORY_LABELS) {
    return CATEGORY_LABELS[categoryId as BuiltInCategory]
  }
  return customCategories.find((c) => c.id === categoryId)?.name ?? categoryId
}

export function getCategoryColor(
  categoryId: Category,
  customCategories: CustomCategory[],
): string {
  if (categoryId in CATEGORY_COLORS) {
    return CATEGORY_COLORS[categoryId as BuiltInCategory]
  }
  return (
    customCategories.find((c) => c.id === categoryId)?.color ??
    CUSTOM_CATEGORY_COLORS[0]
  )
}

export function getCategoriesForType(
  type: TransactionType,
  customCategories: CustomCategory[],
): { id: Category; label: string }[] {
  const builtIn = (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
    (id) => ({ id, label: CATEGORY_LABELS[id] }),
  )
  const custom = customCategories
    .filter((c) => c.type === type)
    .map((c) => ({ id: c.id, label: c.name }))
  return [...builtIn, ...custom]
}

export function pickCustomCategoryColor(index: number): string {
  return CUSTOM_CATEGORY_COLORS[index % CUSTOM_CATEGORY_COLORS.length]
}
