/**
 * Lightweight class-name combiner used by the motion-primitives components.
 * (The upstream library imports `cn` from `@/lib/utils`; this project uses
 * relative imports and a minimal join — no clsx/tailwind-merge needed for our
 * usage since we never pass conflicting Tailwind classes through it.)
 */
export function cn(
  ...inputs: Array<string | number | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(' ')
}
