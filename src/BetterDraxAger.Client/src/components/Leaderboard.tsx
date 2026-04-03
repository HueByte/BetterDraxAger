import type { LeaderboardEntry } from '../api/leaderboard'
import { useAnimatedCount } from '../hooks/useAnimatedCount'
import styles from './Leaderboard.module.css'

const MEDALS = ['🥇', '🥈', '🥉']

interface Props {
  entries: LeaderboardEntry[]
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const display = useAnimatedCount(entry.clicks)

  return (
    <li className={styles.row}>
      <span className={styles.rank}>
        {MEDALS[entry.rank - 1] ?? `#${entry.rank}`}
      </span>
      <span className={styles.username}>{entry.username}</span>
      <span className={styles.clicks}>{display.toLocaleString()}</span>
    </li>
  )
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
          <LeaderboardRow key={entry.username} entry={entry} />
        ))}
      </ul>
    </div>
  )
}
