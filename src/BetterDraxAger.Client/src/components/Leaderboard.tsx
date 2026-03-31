import type { LeaderboardEntry } from '../api/leaderboard'
import styles from './Leaderboard.module.css'

const MEDALS = ['🥇', '🥈', '🥉']

interface Props {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: Props) {
  if (entries.length === 0) {
    return <p className={styles.empty}>No clicks yet. Be the first!</p>
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Leaderboard</h2>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.username} className={styles.row}>
            <span className={styles.rank}>
              {MEDALS[entry.rank - 1] ?? `#${entry.rank}`}
            </span>
            <span className={styles.username}>{entry.username}</span>
            <span className={styles.clicks}>{entry.clicks.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
