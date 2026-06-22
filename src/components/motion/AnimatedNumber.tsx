import { cn } from '../../lib/cn'
import { motion, type SpringOptions, useSpring, useTransform } from 'motion/react'
import { useEffect, useMemo } from 'react'

export type AnimatedNumberProps = {
  value: number
  className?: string
  springOptions?: SpringOptions
  as?: React.ElementType
  /**
   * Custom formatter for each animated frame. Defaults to a rounded,
   * locale-formatted integer. Pass e.g. a currency formatter to keep
   * decimals and symbols while the value springs.
   */
  format?: (value: number) => string
}

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
  format,
}: AnimatedNumberProps) {
  // Memoize: an inline `motion.create` would remount on every value change,
  // resetting the spring and making the number jump instead of animating.
  const MotionComponent = useMemo(
    () => motion.create(as as React.ElementType),
    [as],
  )

  const spring = useSpring(value, springOptions)
  const display = useTransform(spring, (current) =>
    format ? format(current) : Math.round(current).toLocaleString(),
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  )
}
