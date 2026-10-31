import { useRef, useState, useEffect } from 'react'

/**
 * TiltCard provides a subtle, premium 3D tilt effect on hover
 * using CSS 3D transforms and dynamic spotlight reflections.
 * Respects prefers-reduced-motion.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  style = {},
  ...props
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const listener = (event) => setReducedMotion(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const handleMouseMove = (event) => {
    if (reducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const xPercent = (x / rect.width - 0.5) * 2 // -1 to 1
    const yPercent = (y / rect.height - 0.5) * 2 // -1 to 1

    const rotateX = -yPercent * maxTilt
    const rotateY = xPercent * maxTilt

    setTransform(`perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`)
    setGlarePosition({
      x: ((x / rect.width) * 100).toFixed(1),
      y: ((y / rect.height) * 100).toFixed(1),
      opacity: 0.18,
    })
  }

  const handleMouseLeave = () => {
    if (reducedMotion) return
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)')
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: reducedMotion ? 'none' : transform,
        transition: transform ? 'transform 0.12s ease-out' : 'transform 0.4s ease-out',
        ...style,
      }}
      {...props}
    >
      {children}
      {glare && !reducedMotion && (
        <div
          className="tilt-card-glare"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
            opacity: glarePosition.opacity,
          }}
        />
      )}
    </div>
  )
}
