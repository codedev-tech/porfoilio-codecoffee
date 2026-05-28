import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const createParticleElement = (x, y, color) => {
  const element = document.createElement('div')
  element.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: rgba(${color}, 1);
    box-shadow: 0 0 10px rgba(${color}, 0.55);
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 30;
  `
  return element
}

function MagicCard({
  children,
  className = '',
  glowColor = '148, 163, 184',
  spotlightRadius = 360,
  particleCount = 12,
  enableTilt = true,
  enableMagnetism = true,
  enableBorderGlow = true,
  enableSpotlight = true,
  enableStars = true,
  clickEffect = true,
  disableAnimations = false,
}) {
  const cardRef = useRef(null)
  const particlesRef = useRef([])
  const timeoutsRef = useRef([])
  const isHoveredRef = useRef(false)

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'back.in(1.7)',
        onComplete: () => particle.remove(),
      })
    })

    particlesRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearParticles()
    }
  }, [clearParticles])

  const spawnParticles = useCallback(() => {
    if (!enableStars || disableAnimations || !cardRef.current) return

    const { width, height } = cardRef.current.getBoundingClientRect()

    Array.from({ length: particleCount }).forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return

        const particle = createParticleElement(Math.random() * width, Math.random() * height, glowColor)
        cardRef.current.appendChild(particle)
        particlesRef.current.push(particle)

        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' },
        )

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          rotation: Math.random() * 360,
          duration: 1.8 + Math.random() * 1.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        gsap.to(particle, {
          opacity: 0.22,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
        })
      }, index * 80)

      timeoutsRef.current.push(timeoutId)
    })
  }, [disableAnimations, enableStars, glowColor, particleCount])

  const resetCard = useCallback(() => {
    if (!cardRef.current) return

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
    })

    cardRef.current.style.setProperty('--glow-intensity', '0')
  }, [])

  const handleMouseEnter = () => {
    if (disableAnimations) return
    isHoveredRef.current = true
    spawnParticles()
  }

  const handleMouseLeave = () => {
    if (disableAnimations) return
    isHoveredRef.current = false
    clearParticles()
    resetCard()
  }

  const handleMouseMove = (event) => {
    if (disableAnimations || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    cardRef.current.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`)
    cardRef.current.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`)
    cardRef.current.style.setProperty('--glow-intensity', '1')
    cardRef.current.style.setProperty('--glow-radius', `${spotlightRadius}px`)

    if (enableTilt || enableMagnetism) {
      const nextProps = {
        duration: 0.2,
        ease: 'power2.out',
        transformPerspective: 1000,
      }

      if (enableTilt) {
        nextProps.rotateX = ((y - centerY) / centerY) * -8
        nextProps.rotateY = ((x - centerX) / centerX) * 8
      }

      if (enableMagnetism) {
        nextProps.x = (x - centerX) * 0.04
        nextProps.y = (y - centerY) * 0.04
      }

      gsap.to(cardRef.current, nextProps)
    }
  }

  const handleClick = (event) => {
    if (!clickEffect || disableAnimations || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const maxDistance = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - rect.width, y),
      Math.hypot(x, y - rect.height),
      Math.hypot(x - rect.width, y - rect.height),
    )

    const ripple = document.createElement('div')
    ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      border-radius: 9999px;
      pointer-events: none;
      z-index: 25;
      background: radial-gradient(circle, rgba(${glowColor}, 0.45) 0%, rgba(${glowColor}, 0.18) 35%, transparent 70%);
    `

    cardRef.current.appendChild(ripple)

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 1 },
      {
        scale: 1,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      },
    )
  }

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden [transform-style:preserve-3d] ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        '--glow-x': '50%',
        '--glow-y': '50%',
        '--glow-intensity': 0,
        '--glow-radius': `${spotlightRadius}px`,
      }}
    >
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[var(--glow-intensity)] transition-opacity duration-300"
          style={{
            background: `radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgba(${glowColor}, 0.24) 0%, rgba(${glowColor}, 0.12) 22%, rgba(${glowColor}, 0.05) 38%, transparent 68%)`,
          }}
        />
      )}

      {enableBorderGlow && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-inherit opacity-[var(--glow-intensity)] transition-opacity duration-300"
          style={{
            padding: '1px',
            background: `radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgba(${glowColor}, 0.85) 0%, rgba(${glowColor}, 0.4) 18%, transparent 55%)`,
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {children}
    </div>
  )
}

export default MagicCard
