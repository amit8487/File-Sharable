import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Checks whether WebGL is supported in the current environment.
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Creates rounded rectangle shape for 3D glass cards.
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

/**
 * Hero3DScene renders an interactive 3D WebGL illustration of file sharing
 * with translucent glass materials, floating file slabs, sharing arrows,
 * and blue-purple gradient lighting that reacts smoothly to user scroll.
 */
export default function Hero3DScene({ theme = 'light' }) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = reducedMotionQuery.matches
    const handleMotionChange = (e) => { reducedMotion = e.matches }
    reducedMotionQuery.addEventListener('change', handleMotionChange)

    // Scene Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setHasWebGL(false)
      return
    }

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = false
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = isDark ? 1.25 : 1.1
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x242045 : 0xf1edff, isDark ? 1.6 : 2.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 2.4)
    dirLight.position.set(4, 5, 6)
    scene.add(dirLight)

    const blueLight = new THREE.PointLight(0x3b82f6, isDark ? 4.8 : 3.6, 16)
    blueLight.position.set(-3.5, 2.5, 2.5)
    scene.add(blueLight)

    const purpleLight = new THREE.PointLight(0x9333ea, isDark ? 5.2 : 4.0, 16)
    purpleLight.position.set(3.5, -2, 3)
    scene.add(purpleLight)

    const cyanRimLight = new THREE.PointLight(0x06b6d4, isDark ? 3.0 : 2.2, 12)
    cyanRimLight.position.set(0, -3.5, -1)
    scene.add(cyanRimLight)

    // Master Group for 3D elements
    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // 1. Materials: Translucent Liquid Glass
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0xb5a7ff : 0xffffff,
      metalness: 0.05,
      roughness: 0.12,
      transmission: 0.88,
      thickness: 1.1,
      ior: 1.48,
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      attenuationColor: new THREE.Color(isDark ? 0x7c3aed : 0x8b5cf6),
      attenuationDistance: 2.2,
      transparent: true,
      opacity: 0.95,
    })

    const senderGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x93c5fd : 0xf0f7ff,
      metalness: 0.08,
      roughness: 0.15,
      transmission: 0.84,
      thickness: 1.0,
      ior: 1.46,
      clearcoat: 0.9,
      attenuationColor: new THREE.Color(0x3b82f6),
      attenuationDistance: 2.0,
      transparent: true,
      opacity: 0.92,
    })

    const accentBorderMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x8b5cf6 : 0x7157e8,
      transparent: true,
      opacity: isDark ? 0.65 : 0.45,
    })

    // 2. Main File Card (Center-Left / Sender)
    const cardShape = createRoundedRectShape(1.9, 2.5, 0.22)
    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 }
    const cardGeometry = new THREE.ExtrudeGeometry(cardShape, extrudeSettings)
    cardGeometry.center()

    const senderCard = new THREE.Mesh(cardGeometry, senderGlassMaterial)
    senderCard.position.set(-1.45, 0.1, 0.2)
    senderCard.rotation.set(0.12, 0.35, -0.06)
    masterGroup.add(senderCard)

    // Sender Card Edge Wireframe
    const cardEdges = new THREE.EdgesGeometry(cardGeometry, 24)
    const cardWire = new THREE.LineSegments(cardEdges, accentBorderMaterial)
    senderCard.add(cardWire)

    // Decorative inner lines on sender card (mimicking file content)
    const lineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0xc4b5fd : 0x7c3aed, transparent: true, opacity: 0.6 })
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(0.9 - i * 0.15, 0.06, 0.02)
      const lineMesh = new THREE.Mesh(lineGeo, lineMat)
      lineMesh.position.set(-0.25 + i * 0.07, 0.45 - i * 0.32, 0.08)
      senderCard.add(lineMesh)
    }

    // 3. Recipient Device Card (Center-Right / Receiver)
    const receiverShape = createRoundedRectShape(1.8, 2.3, 0.2)
    const receiverGeometry = new THREE.ExtrudeGeometry(receiverShape, extrudeSettings)
    receiverGeometry.center()

    const receiverCard = new THREE.Mesh(receiverGeometry, glassMaterial)
    receiverCard.position.set(1.45, -0.15, -0.1)
    receiverCard.rotation.set(-0.08, -0.38, 0.05)
    masterGroup.add(receiverCard)

    const receiverEdges = new THREE.EdgesGeometry(receiverGeometry, 24)
    const receiverWire = new THREE.LineSegments(receiverEdges, accentBorderMaterial)
    receiverCard.add(receiverWire)

    // Receiver Badge (Code Glyph on screen)
    const badgeGeo = new THREE.BoxGeometry(0.9, 0.42, 0.04)
    const badgeMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x2e1065 : 0xf5f3ff,
      roughness: 0.3,
      metalness: 0.2,
      emissive: isDark ? 0x4c1d95 : 0xe0e7ff,
      emissiveIntensity: 0.3,
    })
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat)
    badgeMesh.position.set(0, 0.1, 0.07)
    receiverCard.add(badgeMesh)

    // 4. Floating Mini File Capsules
    const miniCards = []
    const miniShape = createRoundedRectShape(0.72, 0.9, 0.1)
    const miniGeo = new THREE.ExtrudeGeometry(miniShape, { depth: 0.05, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02 })
    miniGeo.center()

    const miniOffsets = [
      { pos: [-2.1, 1.35, 0.6], rot: [0.2, 0.15, -0.2], speed: 1.2 },
      { pos: [2.05, 1.4, 0.4], rot: [-0.15, -0.2, 0.18], speed: 0.9 },
      { pos: [-0.2, -1.5, 0.7], rot: [0.1, 0.3, 0.1], speed: 1.4 },
    ]

    miniOffsets.forEach((cfg) => {
      const mesh = new THREE.Mesh(miniGeo, glassMaterial)
      mesh.position.set(...cfg.pos)
      mesh.rotation.set(...cfg.rot)
      const edges = new THREE.EdgesGeometry(miniGeo, 24)
      mesh.add(new THREE.LineSegments(edges, accentBorderMaterial))
      masterGroup.add(mesh)
      miniCards.push({ mesh, basePos: [...cfg.pos], speed: cfg.speed })
    })

    // 5. 3D Curved Sharing Arrow (Connecting Sender to Recipient)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.1, 0.3, 0.3),
      new THREE.Vector3(-0.5, 1.1, 0.9),
      new THREE.Vector3(0.5, 1.05, 0.8),
      new THREE.Vector3(1.15, 0.15, 0.15),
    ])

    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.045, 12, false)
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x6366f1,
      emissiveIntensity: isDark ? 1.4 : 0.8,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.7,
      thickness: 0.5,
      transparent: true,
      opacity: 0.88,
    })
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
    masterGroup.add(tubeMesh)

    // Arrow Cone at curve tip
    const coneGeo = new THREE.ConeGeometry(0.12, 0.26, 16)
    coneGeo.rotateX(Math.PI / 2)
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    })
    const coneMesh = new THREE.Mesh(coneGeo, coneMat)
    coneMesh.position.set(1.18, 0.08, 0.12)
    coneMesh.rotation.set(0.65, 0.8, -0.4)
    masterGroup.add(coneMesh)

    // 6. Traveling Pulse Beads along the curve
    const pulseCount = 4
    const pulseSpheres = []
    const pulseGeo = new THREE.SphereGeometry(0.07, 16, 16)
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa })

    for (let i = 0; i < pulseCount; i++) {
      const p = new THREE.Mesh(pulseGeo, pulseMat)
      masterGroup.add(p)
      pulseSpheres.push({ mesh: p, offset: i / pulseCount })
    }

    // 7. Ambient Glowing Data Particles
    const particleCount = 40
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      color: isDark ? 0xa78bfa : 0x818cf8,
      transparent: true,
      opacity: isDark ? 0.75 : 0.55,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    masterGroup.add(particles)

    // Orbital Halo Ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.015, 16, 80)
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x6366f1 : 0xa5b4fc,
      transparent: true,
      opacity: isDark ? 0.28 : 0.2,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2.3
    masterGroup.add(ringMesh)

    // Mouse and Scroll tracking
    let targetRotX = 0
    let targetRotY = 0
    let currentRotX = 0
    let currentRotY = 0
    let scrollProgress = 0

    const handleMouseMove = (event) => {
      if (reducedMotion) return
      const rect = container.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotY = x * 0.28
      targetRotX = -y * 0.2
    }

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      const maxScroll = Math.max(window.innerHeight, 600)
      scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1.5)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Pause rendering when hero is scrolled out of viewport
    let isVisible = true
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    }, { threshold: 0.05 })
    observer.observe(container)

    // Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (!isVisible) return

      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse lerp
      currentRotX += (targetRotX - currentRotX) * 0.06
      currentRotY += (targetRotY - currentRotY) * 0.06

      if (!reducedMotion) {
        // Base subtle idle rotation + mouse tilt + scroll rotation
        masterGroup.rotation.y = currentRotY + Math.sin(elapsedTime * 0.4) * 0.05 + scrollProgress * 0.8
        masterGroup.rotation.x = currentRotX + Math.cos(elapsedTime * 0.3) * 0.04 - scrollProgress * 0.4
        masterGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08 - scrollProgress * 0.6
        masterGroup.position.z = -scrollProgress * 1.2

        // Float mini cards
        miniCards.forEach(({ mesh, basePos, speed }, idx) => {
          mesh.position.y = basePos[1] + Math.sin(elapsedTime * speed + idx) * 0.09
          mesh.rotation.z = Math.sin(elapsedTime * 0.5 + idx) * 0.06
        })

        // Sender & receiver subtle breathing
        senderCard.position.y = 0.1 + Math.sin(elapsedTime * 0.9) * 0.05
        receiverCard.position.y = -0.15 + Math.cos(elapsedTime * 0.8) * 0.05

        // Move pulses along the curve
        pulseSpheres.forEach((p) => {
          const t = ((elapsedTime * 0.35 + p.offset) % 1.0)
          const pt = curve.getPointAt(t)
          p.mesh.position.copy(pt)
          p.mesh.scale.setScalar(0.7 + Math.sin(t * Math.PI) * 0.6)
        })

        // Gentle particle rotation
        particles.rotation.y = elapsedTime * 0.02
        ringMesh.rotation.z = elapsedTime * 0.04
      } else {
        // Static clean composition for reduced-motion
        masterGroup.rotation.y = 0.2 + scrollProgress * 0.3
        masterGroup.rotation.x = -0.1
        pulseSpheres.forEach((p) => {
          const pt = curve.getPointAt(p.offset)
          p.mesh.position.copy(pt)
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', handleScroll)
      reducedMotionQuery.removeEventListener('change', handleMotionChange)
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        resizeObserver.disconnect()
        observer.disconnect()
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      // Dispose Three.js objects
      cardGeometry.dispose()
      receiverGeometry.dispose()
      miniGeo.dispose()
      tubeGeo.dispose()
      coneGeo.dispose()
      pulseGeo.dispose()
      particleGeo.dispose()
      ringGeo.dispose()
      badgeGeo.dispose()

      glassMaterial.dispose()
      senderGlassMaterial.dispose()
      accentBorderMaterial.dispose()
      lineMat.dispose()
      badgeMat.dispose()
      tubeMat.dispose()
      coneMat.dispose()
      pulseMat.dispose()
      particleMat.dispose()
      ringMat.dispose()
      renderer.dispose()
    }
  }, [theme])

  return (
    <div className="hero-3d-wrapper" aria-hidden="true">
      <div ref={containerRef} className="hero-3d-canvas-container">
        {!hasWebGL && (
          <div className="hero-3d-fallback">
            <div className="fallback-glass-card fallback-sender">
              <span className="fallback-pill">Ready to send</span>
              <div className="fallback-file-icon">📄</div>
              <strong>presentation.pdf</strong>
              <small>18.4 MB</small>
            </div>
            <div className="fallback-arrow">
              <span className="fallback-stream-line" />
              <span className="fallback-stream-badge">6-Char Token</span>
            </div>
            <div className="fallback-glass-card fallback-receiver">
              <span className="fallback-pill">Instant pickup</span>
              <div className="fallback-code-box">A8K2PX</div>
              <small>No account required</small>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
