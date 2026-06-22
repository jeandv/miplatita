import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '../../hooks/useTheme'
import { InView } from '../motion/InView'
import { TextEffect } from '../motion/TextEffect'
import { TextShimmer } from '../motion/TextShimmer'
import { Magnetic } from '../motion/Magnetic'
import { Tilt } from '../motion/Tilt'

interface LandingPageProps {
  onRegister: () => void
  onLogin: () => void
  onGuest: () => void
}

/**
 * Reveal-on-scroll wrapper, now powered by motion-primitives' `InView`.
 * Fades + blur-slides its children into view the first time they enter the
 * viewport. `delay` is in milliseconds (kept for call-site compatibility) and
 * converted to seconds for motion. Reduced-motion is handled globally by the
 * <MotionConfig reducedMotion="user"> in main.tsx.
 */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <InView
      className={className}
      once
      viewOptions={{ once: true, margin: '0px 0px -40px 0px' }}
      variants={{
        hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </InView>
  )
}

/** Decorative monochrome glow. Reused across sections for a subtle premium depth. */
function Glow({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={['pointer-events-none absolute rounded-full bg-app-accent-soft blur-3xl', className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

const features = [
  {
    title: 'Todas tus monedas, sin mezclar',
    description:
      'Pesos, dólares, euros o lo que manejes. Mi Platita suma cada moneda por separado para mostrarte tu total real.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  {
    title: 'Carga un gasto en dos toques',
    description:
      'Nada de formularios eternos. Anotas cuánto, en qué y listo. Tan rápido que de verdad lo vas a usar todos los días.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7Z"
      />
    ),
  },
  {
    title: 'Mira a dónde se va tu plata',
    description:
      'Estadísticas por categoría, mes a mes. Por fin vas a saber qué se come tu sueldo, con números claros.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    ),
  },
  {
    title: 'Tus números, solo tuyos',
    description:
      '¿Estás en público o con gente al lado? Oculta todos los montos con un toque. Tu privacidad no se negocia.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    ),
  },
  {
    title: 'Todas tus cuentas juntas',
    description:
      'Efectivo, banco, billetera virtual, tarjeta. Suma las cuentas que quieras y mira tu situación completa de un vistazo.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
      />
    ),
  },
  {
    title: 'Nada que instalar',
    description:
      'Funciona directo en el navegador, en el celular o la computadora. Abres, entras y empiezas. Sin descargas.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
      />
    ),
  },
] as const

const steps = [
  {
    number: '1',
    title: 'Crea tu cuenta gratis',
    description: 'En segundos y sin tarjeta. Tu información queda guardada y sincronizada.',
  },
  {
    number: '2',
    title: 'Carga cuentas y movimientos',
    description: 'Suma tus cuentas y anota gastos e ingresos a medida que pasan. Rápido, sin fricción.',
  },
  {
    number: '3',
    title: 'Toma el control',
    description: 'Mira tus estadísticas, descubre fugas de plata y decide con datos reales.',
  },
] as const

export function LandingPage({ onRegister, onLogin, onGuest }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-app text-app-fg">
      {/* Ambient glow */}
      <Glow className="animate-ambient-float left-1/2 top-[-120px] h-[480px] w-[480px] -translate-x-1/2" />

      {/* ---------- Nav ---------- */}
      <header className="relative z-20 pt-safe">
        <nav className="mx-auto mt-5 flex max-w-5xl items-center justify-between px-5 py-4 sm:mt-8">
          <a
            href="#top"
            className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-app-accent text-app-accent-fg shadow-accent">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </span>
            <TextShimmer as="span" duration={3} className="text-base font-bold tracking-tight">
              Mi Platita
            </TextShimmer>
          </a>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-app-elevated hover:text-app-fg"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:text-app-fg"
            >
              Iniciar sesión
            </button>
            <Magnetic intensity={0.4} range={120}>
              <button
                type="button"
                onClick={onRegister}
                className="btn-sheen rounded-lg bg-app-accent bg-app-accent-hover px-4 py-2 text-sm font-semibold text-app-accent-fg shadow-accent transition-all duration-200 active:scale-[0.97]"
              >
                Registrarse
              </button>
            </Magnetic>
          </div>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <main id="top" className="relative z-10">
        <section className="mx-auto max-w-3xl px-5 pb-16 pt-10 text-center sm:pt-16">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-app bg-app-accent-soft px-4 py-1.5 text-sm text-app-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-app-accent" />
              Gratis · Sin tarjeta · Multi-moneda
            </div>
          </Reveal>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            <TextEffect as="span" per="word" preset="fade-in-blur" className="inline">
              Controla tu
            </TextEffect>
            <br />
            {/*
              Gradient text must keep `bg-clip-text` on the SAME element that
              holds the glyphs. TextEffect splits text into transformed/filtered
              child spans, and iOS Safari refuses to clip an ancestor's gradient
              onto text inside a transformed descendant → the words rendered
              fully transparent (invisible) on mobile. A single motion.span
              animating opacity+y (no filter on the clipped element) is safe
              across browsers.
            */}
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block bg-gradient-to-r from-[var(--app-fg)] to-[var(--app-muted)] bg-clip-text text-transparent"
            >
              Plata fácil.
            </motion.span>
          </h1>

          <TextEffect
            as="p"
            per="word"
            preset="fade-in-blur"
            delay={0.7}
            speedReveal={1.6}
            className="mx-auto mt-6 max-w-xl text-lg text-app-muted sm:text-xl"
          >
            Registra gastos e ingresos en segundos, en todas tus monedas, y mira exactamente a dónde se va cada centavo. Simple, rápido y sin vueltas.
          </TextEffect>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic intensity={0.5} range={160} className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onRegister}
                  className="btn-sheen group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-app-accent bg-app-accent-hover px-8 py-4 text-base font-semibold text-app-accent-fg shadow-accent transition-all duration-200 active:scale-[0.97] sm:w-auto"
                >
                  Crear mi cuenta gratis
                  <svg
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </Magnetic>
              <Magnetic intensity={0.3} range={140} className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onGuest}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-app bg-app-surface/50 px-8 py-4 text-base font-medium text-app-fg transition-all duration-200 hover:bg-app-elevated active:scale-[0.97] sm:w-auto"
                >
                  Probar como invitado
                </button>
              </Magnetic>
            </div>
          </Reveal>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="relative mx-auto max-w-5xl px-5 py-16">
          <Glow className="right-[-60px] top-20 h-72 w-72" />
          <Glow className="bottom-0 left-[-80px] h-64 w-64" />

          <Reveal className="relative mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para ordenar tu plata
            </h2>
            <p className="mt-4 text-app-muted">
              Sin planillas, sin complicaciones. Solo las herramientas que de verdad usas.
            </p>
          </Reveal>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 70} className="h-full">
                <Tilt rotationFactor={6} className="h-full">
                  <article className="h-full rounded-2xl border border-app bg-app-surface/50 p-6 transition-colors duration-300 hover:border-app-accent hover:bg-app-surface hover:shadow-premium">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-app-accent text-app-accent-fg shadow-accent">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        {feature.icon}
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-app-muted">{feature.description}</p>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="como-funciona" className="relative mx-auto max-w-5xl px-5 py-16">
          <Glow className="left-1/2 top-0 h-72 w-72 -translate-x-1/2" />

          <Reveal className="relative mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Empieza en 3 pasos</h2>
            <p className="mt-4 text-app-muted">De cero a tener el control en minutos.</p>
          </Reveal>

          <div className="relative grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 100}>
                <div className="h-full rounded-2xl border border-app bg-app-surface/50 p-6">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-app-accent text-base font-bold text-app-accent-fg shadow-accent">
                    {step.number}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-app-muted">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-app bg-app-accent-soft px-6 py-14 text-center">
              <Glow className="left-1/2 top-0 h-64 w-64 -translate-x-1/2" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Empieza a controlar tu plata hoy
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-app-muted">
                  Cada día sin registrar es plata que se escapa sin darte cuenta. Es gratis
                  y toma menos de un minuto.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Magnetic intensity={0.5} range={160} className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onRegister}
                      className="btn-sheen inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-app-accent bg-app-accent-hover px-8 py-4 text-base font-semibold text-app-accent-fg shadow-accent transition-all duration-200 active:scale-[0.97] sm:w-auto"
                    >
                      Crear mi cuenta gratis
                    </button>
                  </Magnetic>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="text-sm font-medium text-app-muted transition-colors hover:text-app-fg"
                  >
                    Ya tengo cuenta →
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 border-t border-app">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 pb-safe text-sm text-app-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-app-accent text-app-accent-fg">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33"
                />
              </svg>
            </span>
            <span className="font-medium text-app-fg">Mi Platita</span>
          </div>

          <p>
            Creado por{' '}
            <a
              href="https://jeanrondon.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-app-accent transition-opacity duration-200 hover:opacity-70"
            >
              jeanrondon.dev
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
