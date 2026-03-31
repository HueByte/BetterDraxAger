import { memo, useEffect, useRef, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const particlesConfig = {
  background: { color: { value: '#0d0d14' } },
  particles: {
    number: { value: 120 },
    color: { value: ['#9b2a95', '#c76d57', '#ed8653'] },
    opacity: { value: { min: 0.2, max: 0.6 } },
    size: { value: { min: 1, max: 4 } },
    move: {
      enable: true,
      speed: 0.6,
      direction: 'top' as const,
      outModes: 'out' as const,
      random: true,
    },
    links: { enable: false },
  },
}

export const ParticleBackground = memo(function ParticleBackground() {
  const [ready, setReady] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <Particles
      id="tsparticles"
      options={particlesConfig}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    />
  )
})
