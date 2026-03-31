import { useState } from 'react'
import styles from './BirthdayButton.module.css'

interface Props {
  onClick: () => void
}

export function BirthdayButton({ onClick }: Props) {
  const [flashing, setFlashing] = useState(false)

  const handleClick = () => {
    onClick()
    setFlashing(true)
    setTimeout(() => setFlashing(false), 300)
  }

  return (
    <button
      className={`${styles.button} ${flashing ? styles.flash : ''}`}
      onClick={handleClick}
    >
      🎂 Happy Birthday!
    </button>
  )
}
