
/**
 * Grainy gradient backdrop for the app home. Sits at the top and fades into the
 * middle of the screen. A grayscale SVG noise (feTurbulence) is blended over the
 * theme gradient to give it a granular, premium texture.
 *
 * It reacts to interaction: a global (capture-phase) pointerdown listener nudges
 * the whole layer with a spring whenever the user presses an interactive element
 * (button, toggle, input, link...). This keeps the effect decoupled — individual
 * controls don't need to know about the background. Reduced-motion users are
 * covered by the global <MotionConfig reducedMotion="user"> in main.tsx.
 */
export function GrainGradient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60vh] origin-top overflow-hidden [mask-image:linear-gradient(to_bottom,#000_0%,#000_35%,transparent_90%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_35%,transparent_90%)]"
    >
      {/* Theme gradient (neutral B&W tokens) */}
      <div className="absolute inset-0 bg-top-hero-gradient" />

      {/* Soft accent glow near the top */}
      <div className="absolute left-1/2 top-[-12%] h-[420px] w-[130%] -translate-x-1/2 rounded-full bg-app-accent-soft blur-3xl" />

      {/* Granular noise overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.16] mix-blend-soft-light dark:opacity-[0.22] dark:mix-blend-overlay">
        <filter id="grain-gradient-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-gradient-noise)" />
      </svg>
    </div>
  )
}
