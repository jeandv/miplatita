import { type ReactNode, useMemo, useRef, useState } from 'react'
import {
  motion,
  useInView,
  type Variant,
  type Transition,
  type UseInViewOptions,
} from 'motion/react'

export type InViewProps = {
  children: ReactNode
  variants?: {
    hidden: Variant
    visible: Variant
  }
  transition?: Transition
  viewOptions?: UseInViewOptions
  as?: React.ElementType
  once?: boolean
  className?: string
}

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once,
  className,
}: InViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, viewOptions)
  const [isViewed, setIsViewed] = useState(false)

  // `motion.create` returns a brand-new component identity on every call.
  // Calling it inline would make React unmount/remount the subtree on each
  // render, resetting the animation to `initial` (opacity:0) — which is why
  // reveal elements intermittently stayed invisible. Memoize on `as`.
  const MotionComponent = useMemo(
    () => motion.create(as as React.ElementType),
    [as],
  )

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      onAnimationComplete={() => {
        if (once) setIsViewed(true)
      }}
      animate={isInView || isViewed ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}
