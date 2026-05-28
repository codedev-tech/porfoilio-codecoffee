import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { gsap } from 'gsap'

const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  onTypingComplete,
  onTextUpdate,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(!startOnVisible)
  const cursorRef = useRef(null)
  const containerRef = useRef(null)
  const typingCompletedRef = useRef(false)

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text])

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed
    const { min, max } = variableSpeed
    return Math.random() * (max - min) + min
  }, [variableSpeed, typingSpeed])

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return 'inherit'
    return textColors[currentTextIndex % textColors.length]
  }

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [startOnVisible])

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return

    gsap.set(cursorRef.current, { opacity: 1 })
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    })

    return () => {
      tween.kill()
    }
  }, [showCursor, cursorBlinkDuration])

  useEffect(() => {
    if (!isVisible) return

    let timeout

    const currentText = textArray[currentTextIndex]
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false)

          if (currentTextIndex === textArray.length - 1 && !loop) {
            return
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex)
          }

          setCurrentTextIndex((previous) => (previous + 1) % textArray.length)
          setCurrentCharIndex(0)
          timeout = setTimeout(() => {}, pauseDuration)
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((previous) => previous.slice(0, -1))
          }, deletingSpeed)
        }

        return
      }

      if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText((previous) => previous + processedText[currentCharIndex])
            setCurrentCharIndex((previous) => previous + 1)
          },
          variableSpeed ? getRandomSpeed() : typingSpeed,
        )
      } else if (textArray.length >= 1) {
        if (!loop && currentTextIndex === textArray.length - 1) return

        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    }

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(executeTypingAnimation, initialDelay)
    } else {
      executeTypingAnimation()
    }

    return () => clearTimeout(timeout)
  }, [
    currentCharIndex,
    currentTextIndex,
    deletingSpeed,
    displayedText,
    getRandomSpeed,
    initialDelay,
    isDeleting,
    isVisible,
    loop,
    onSentenceComplete,
    onTypingComplete,
    pauseDuration,
    reverseMode,
    textArray,
    typingSpeed,
    variableSpeed,
  ])

  useEffect(() => {
    if (isDeleting) {
      typingCompletedRef.current = false
      return
    }

    const currentText = textArray[currentTextIndex]
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText

    if (displayedText === processedText && !typingCompletedRef.current) {
      typingCompletedRef.current = true
      onTypingComplete?.(textArray[currentTextIndex], currentTextIndex)
    }
  }, [currentTextIndex, displayedText, isDeleting, onTypingComplete, reverseMode, textArray])

  useEffect(() => {
    if (isDeleting) return
    onTextUpdate?.(displayedText, textArray[currentTextIndex], currentTextIndex)
  }, [currentTextIndex, displayedText, isDeleting, onTextUpdate, textArray])

  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < textArray[currentTextIndex].length || isDeleting)

  return createElement(
    Component,
    {
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    <span ref={containerRef} className="inline">
      <span className="inline" style={{ color: getCurrentTextColor() }}>
        {displayedText}
      </span>
      {showCursor && (
        <span
          ref={cursorRef}
          className={`ml-1 inline-block opacity-100 ${shouldHideCursor ? 'hidden' : ''} ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </span>,
  )
}

export default TextType
