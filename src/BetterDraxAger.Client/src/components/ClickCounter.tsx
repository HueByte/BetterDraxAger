import styles from './ClickCounter.module.css'

interface Props {
  total: number
}

export function ClickCounter({ total }: Props) {
  return (
    <p className={styles.counter}>
      Drax has been aged{' '}
      <span key={total} className={styles.number}>
        {total.toLocaleString()}
      </span>{' '}
      {total === 1 ? 'time' : 'times'}
    </p>
  )
}
