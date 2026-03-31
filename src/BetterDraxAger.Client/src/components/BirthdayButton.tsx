import { useState } from 'react'
import styles from './BirthdayButton.module.css'

interface Props {
  onClick: () => Promise<void>
  disabled: boolean
}

export function BirthdayButton({ onClick, disabled }: Props) {
  const [flashing, setFlashing] = useState(false)

  const handleClick = async () => {
    if (disabled || flashing) return
    setFlashing(true)
    await onClick()
    setTimeout(() => setFlashing(false), 600)
  }

  return (
    <button
      className={`${styles.button} ${flashing ? styles.flash : ''}`}
      onClick={handleClick}
      disabled={disabled || flashing}
    >
      🎂 Happy Birthday!
    </button>
  )
}
