import {
  createRef,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type MutableRefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react'

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId = 0

    const loop = () => {
      callback()
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(frameId)
  }, [callback])
}

function useMousePositionRef(containerRef: MutableRefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        positionRef.current = { x: x - rect.left, y: y - rect.top }
        return
      }

      positionRef.current = { x, y }
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      updatePosition(touch.clientX, touch.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [containerRef])

  return positionRef
}

interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: MutableRefObject<HTMLElement | null>
  radius?: number
  falloff?: 'linear' | 'exponential' | 'gaussian'
  className?: string
  onClick?: () => void
  style?: CSSProperties
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = 'linear',
    className = '',
    onClick,
    style,
    ...restProps
  } = props

  const mousePositionRef = useMousePositionRef(containerRef)
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const words = useMemo(() => {
    let nextLetterIndex = 0

    return label.split(' ').map((word, wordIndex) => ({
      key: `${word}-${wordIndex}`,
      letters: word.split('').map((letter) => ({
        letter,
        index: nextLetterIndex++,
      })),
    }))
  }, [label])

  const letterRefs = useMemo(
    () =>
      Array.from(
        { length: words.reduce((count, word) => count + word.letters.length, 0) },
        () => createRef<HTMLSpanElement>(),
      ),
    [words],
  )

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsString: string) =>
      new Map(
        settingsString
          .split(',')
          .map((segment) => segment.trim())
          .map((segment) => {
            const [axisName, axisValue] = segment.split(' ')
            return [axisName.replace(/['"]/g, ''), parseFloat(axisValue)]
          }),
      )

    const fromSettings = parseSettings(fromFontVariationSettings)
    const toSettings = parseSettings(toFontVariationSettings)

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }))
  }, [fromFontVariationSettings, toFontVariationSettings])

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

  const calculateFalloff = (distance: number) => {
    const normalized = Math.min(Math.max(1 - distance / radius, 0), 1)

    switch (falloff) {
      case 'exponential':
        return normalized ** 2
      case 'gaussian':
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2)
      case 'linear':
      default:
        return normalized
    }
  }

  useAnimationFrame(() => {
    if (!containerRef.current) return

    const { x, y } = mousePositionRef.current
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) return

    lastPositionRef.current = { x, y }
    const containerRect = containerRef.current.getBoundingClientRect()

    letterRefs.forEach((letterRef) => {
      const letterElement = letterRef.current
      if (!letterElement) return

      const rect = letterElement.getBoundingClientRect()
      const letterCenterX = rect.left + rect.width / 2 - containerRect.left
      const letterCenterY = rect.top + rect.height / 2 - containerRect.top

      const distance = calculateDistance(x, y, letterCenterX, letterCenterY)

      if (distance >= radius) {
        letterElement.style.fontVariationSettings = fromFontVariationSettings
        return
      }

      const falloffValue = calculateFalloff(distance)
      const newSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue
          return `'${axis}' ${interpolatedValue}`
        })
        .join(', ')

      letterElement.style.fontVariationSettings = newSettings
    })
  })

  return (
    <span
      ref={ref}
      className={className}
      onClick={onClick}
      style={{
        display: 'inline',
        fontFamily: '"Roboto Flex", sans-serif',
        ...style,
      }}
      {...restProps}
    >
      {words.map((word) => (
        <span key={word.key} className="inline-block whitespace-nowrap">
          {word.letters.map(({ letter, index }) => {
            return (
              <span
                key={index}
                ref={letterRefs[index]}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  fontVariationSettings: fromFontVariationSettings,
                }}
              >
                {letter}
              </span>
            )
          })}
          {word.key !== words[words.length - 1]?.key && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
})

VariableProximity.displayName = 'VariableProximity'

export default VariableProximity