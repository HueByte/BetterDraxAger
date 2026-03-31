import styles from './ClickEffect.module.css'

// GIFs are already animated — treat separately
const STATIC_IMAGES = [
  '/rotato/1.png',
  '/rotato/2.png',
  '/rotato/5.webp',
  '/rotato/6.webp',
  '/rotato/7.webp',
  '/rotato/8.webp',
  '/rotato/9.webp',
  '/rotato/10.webp',
  '/rotato/11.webp',
  '/rotato/12.webp',
  '/rotato/13.webp',
  '/rotato/14.webp',
  '/rotato/15.webp',
  '/rotato/16.webp',
  '/rotato/17.webp',
  '/rotato/18.webp',
  '/rotato/19.webp',
]

const GIF_IMAGES = ['/rotato/3.gif', '/rotato/4.gif']

function pickImage(): { img: string; isGif: boolean } {
  // 20% chance to get a GIF
  const isGif = Math.random() < 0.2
  const pool = isGif ? GIF_IMAGES : STATIC_IMAGES
  return { img: pool[Math.floor(Math.random() * pool.length)], isGif }
}

export interface ClickEffectItem {
  id: number
  x: number
  y: number
  size: number
  img: string
  spin: number
  tx: number
  ty: number
  duration: number
  scalePeak: number
  scaleEnd: number
}

interface Props {
  effects: ClickEffectItem[]
  onDone: (id: number) => void
}

export function ClickEffect({ effects, onDone }: Props) {
  return (
    <div className={styles.container}>
      {effects.map((e) => (
        <img
          key={e.id}
          src={e.img}
          className={styles.item}
          style={{
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            animationDuration: `${e.duration}s`,
            '--spin': `${e.spin}deg`,
            '--tx': `${e.tx}px`,
            '--ty': `${e.ty}px`,
            '--scale-peak': e.scalePeak,
            '--scale-end': e.scaleEnd,
          } as React.CSSProperties}
          onAnimationEnd={() => onDone(e.id)}
          alt=""
        />
      ))}
    </div>
  )
}

export function makeEffect(id: number): ClickEffectItem {
  const { img, isGif } = pickImage()

  // GIFs: bigger, slower, fewer rotations so their own animation stays readable
  const size = isGif
    ? 100 + Math.random() * 120                          // 100–220px
    : 40 + Math.random() * 160                          // 40–200px

  const angle = Math.random() * Math.PI * 2
  const distance = 120 + Math.random() * 350
  const spinRounds = isGif
    ? (1 + Math.floor(Math.random() * 2)) * (Math.random() > 0.5 ? 1 : -1)   // 1–2 rotations
    : (2 + Math.floor(Math.random() * 5)) * (Math.random() > 0.5 ? 1 : -1)   // 2–6 rotations

  return {
    id,
    x: Math.random() * (window.innerWidth - size),
    y: Math.random() * (window.innerHeight - size),
    size,
    img,
    spin: spinRounds * 360,
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance,
    duration: isGif
      ? 2.5 + Math.random() * 1.5                      // 2.5–4.0s (slower)
      : 1.5 + Math.random() * 1.5,                     // 1.5–3.0s
    scalePeak: isGif
      ? 1.1 + Math.random() * 0.4                      // subtle burst for GIFs
      : 1.3 + Math.random() * 1.2,                     // aggressive burst for statics
    scaleEnd: 0.05 + Math.random() * 0.3,
  }
}
