import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import profileImage from './assets/batobato.png'
import MagicCard from './components/MagicCard'
import ShapeGrid from './components/ShapeGrid'
import TextType from './components/TextType'
import VariableProximity from './components/VariableProximity'

function App() {
  const linkedInUrl = 'https://www.linkedin.com/in/leo-gannad-a66a48410'
  const githubUrl = 'https://github.com/codedev-tech'
  const resumeUrl = '/Leo-Gannad-Resume.pdf'
  const rootRef = useRef<HTMLDivElement | null>(null)
  const nameContainerRef = useRef<HTMLDivElement | null>(null)
  const actionsRef = useRef<HTMLDivElement | null>(null)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    if (!rootRef.current) return

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-intro="header"]', {
          y: -28,
          opacity: 0,
          duration: 0.8,
        })
        .from(
          '[data-intro="eyebrow"]',
          {
            y: 20,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.45',
        )
        .from(
          '[data-intro="name"]',
          {
            y: 28,
            opacity: 0,
            duration: 0.75,
          },
          '-=0.28',
        )
        .from(
          '[data-intro="title"]',
          {
            y: 20,
            opacity: 0,
            duration: 0.45,
          },
          '-=0.5',
        )
        .from(
          '[data-intro="description"]',
          {
            y: 20,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.3',
        )
        .from(
          '[data-intro="portrait"]',
          {
            x: 36,
            scale: 0.96,
            opacity: 0,
            duration: 0.9,
          },
          '-=0.7',
        )
    }, rootRef)

    return () => context.revert()
  }, [])

  useEffect(() => {
    if (!showActions || !actionsRef.current) return

    const buttons = actionsRef.current.querySelectorAll('[data-action-button]')
    if (buttons.length === 0) return

    gsap.fromTo(
      buttons,
      {
        y: 18,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
      },
    )
  }, [showActions])

  return (
    <div ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-[#120f17] text-white">
      <div className="fixed inset-0">
        <ShapeGrid
          speed={0.18}
          squareSize={38}
          direction="diagonal"
          borderColor="#2F293A"
          hoverFillColor="#94a3b8"
          shape="hexagon"
          hoverTrailAmount={1}
        />
      </div>

      <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-7">
        <header
          data-intro="header"
          className="fixed left-1/2 top-4 z-30 w-[calc(100%-2.5rem)] max-w-6xl -translate-x-1/2 sm:w-[calc(100%-4rem)]"
        >
          <div className="flex items-center justify-between rounded-[26px] border border-white/10 bg-[#1b1724]/80 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <div>
                <p className=" text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                  Portfolio
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
              <a className="transition hover:text-white" href="#about">
                About
              </a>
              <a className="transition hover:text-white" href="#experience">
                Experience
              </a>
              <a className="transition hover:text-white" href="#skills">
                Skills
              </a>
              <a className="transition hover:text-white" href="#certificate">
                Certificate
              </a>
              <a className="transition hover:text-white" href="#projects">
                Projects
              </a>
              <a className="transition hover:text-white" href="#contact">
                Contact
              </a>
            </nav>

            <a
              className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#120f17] transition hover:bg-[#e8e8ed]"
              download
              href={resumeUrl}
            >
              Resume
            </a>
          </div>
        </header>

        <main className="mx-auto h-[calc(100vh-2rem)] w-full max-w-6xl pt-20 sm:h-[calc(100vh-3rem)] sm:pt-18">
          <section className="grid h-[calc(100vh-7rem)] items-center gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
            <div className="max-w-3xl">
              <div
                data-intro="eyebrow"
                className="mb-6 inline-flex items-center rounded-full border border-[#94a3b8]/25 bg-[#14111b]/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#c2cede]"
              >
                Building practical digital experiences
              </div>

              <div ref={nameContainerRef} data-intro="name" className="relative max-w-2xl">
                <VariableProximity
                  label="Leo B. Gannad"
                  className="block text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl"
                  fromFontVariationSettings="'wght' 620, 'opsz' 14"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={nameContainerRef}
                  radius={140}
                  falloff="gaussian"
                />
              </div>

              <p data-intro="title" className="mt-3 text-lg font-medium text-[#b6bfd0] sm:text-xl">
                3rd Year BSIT
              </p>

              <TextType
                as="p"
                data-intro="description"
                className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg"
                text="Aspiring IT professional focused on building clean, responsive, and reliable web experiences that turn ideas into useful products."
                typingSpeed={70}
                initialDelay={300}
                pauseDuration={1500}
                deletingSpeed={24}
                loop={true}
                onTextUpdate={(value) => {
                  if (value.startsWith('Aspiring')) {
                    setShowActions(true)
                  }
                }}
                showCursor
                cursorCharacter="_"
                cursorClassName="text-[#94a3b8]"
                variableSpeed={{ min: 60, max: 100 }}
              />

              <div ref={actionsRef} data-intro="actions" className={`mt-7 flex flex-wrap items-center gap-4 ${showActions ? '' : 'pointer-events-none'}`}>
                <a
                  data-action-button
                  className="rounded-2xl bg-[#94a3b8] px-6 py-3 text-sm font-semibold text-[#120f17] transition hover:bg-[#b4c0d4]"
                  href="#projects"
                  style={showActions ? undefined : { opacity: 0, transform: 'translateY(18px)' }}
                >
                  View Projects
                </a>
                <a
                  data-action-button
                  className="rounded-2xl border border-white/14 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  href={githubUrl}
                  rel="noreferrer"
                  target="_blank"
                  style={showActions ? undefined : { opacity: 0, transform: 'translateY(18px)' }}
                >
                  View GitHub
                </a>
                <a
                  data-action-button
                  className="rounded-2xl border border-white/14 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  href={linkedInUrl}
                  rel="noreferrer"
                  target="_blank"
                  style={showActions ? undefined : { opacity: 0, transform: 'translateY(18px)' }}
                >
                  Connect on LinkedIn
                </a>
              </div>
            </div>

            <div data-intro="portrait" className="relative hidden justify-self-end lg:block">
              <div className="absolute -inset-5 rounded-[38px] bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.2),transparent_60%)] blur-2xl" />
              <MagicCard
                className="relative rounded-[32px] border border-white/10 bg-[#17131f]/80 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md"
                enableBorderGlow
                enableSpotlight
                enableTilt
                glowColor="148, 163, 184"
                spotlightRadius={420}
              >
                <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#110e17]">
                  <img alt="Leo B. Gannad portrait" className="h-[390px] w-[320px] object-cover object-center" src={profileImage} />
                </div>
              </MagicCard>
            </div>
          </section>

          <section id="about" className="hidden" />
          <section id="experience" className="hidden" />
          <section id="skills" className="hidden" />
          <section id="certificate" className="hidden" />
          <section id="projects" className="hidden" />
          <section id="contact" className="hidden" />
        </main>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.12),transparent_34%),linear-gradient(180deg,rgba(18,15,23,0.05),rgba(18,15,23,0.55))]" />
    </div>
  )
}

export default App
