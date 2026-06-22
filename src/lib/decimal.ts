/**
 * Decimal input helpers.
 *
 * Native `<input type="number">` is hostile to real-world typing: it rejects
 * the comma separator used across LatAm/EU keyboards, drops intermediate
 * states like "1." or "0.", and behaves inconsistently per locale. We instead
 * use `type="text"` + `inputMode="decimal"` and sanitize manually so the user
 * can type freely while we keep the underlying string parseable.
 */

/**
 * Sanitize a raw input string into a valid decimal-in-progress string.
 * - Accepts both "," and "." as the decimal separator (normalized to ".").
 * - Strips any other non-numeric character.
 * - Keeps only the first separator (collapses extra ones).
 * - Preserves intermediate states like "" , "1." or "0." so typing isn't blocked.
 */
export function sanitizeDecimalInput(raw: string): string {
  let s = raw.replace(/,/g, '.').replace(/[^\d.]/g, '')

  const firstDot = s.indexOf('.')
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '')
  }

  return s
}

/**
 * Parse a (possibly comma-separated) decimal string into a number.
 * Returns NaN for empty/invalid input so callers can validate.
 */
export function parseDecimal(value: string): number {
  if (value.trim() === '') return NaN
  return parseFloat(value.replace(/,/g, '.'))
}
