import { useState, useEffect, useCallback } from 'react'
import type { LeaderboardEntry } from '../api/leaderboard'
import { getLeaderboard } from '../api/leaderboard'

export function useLeaderboard(top = 50) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  const refresh = useCallback(async () => {
    try {
      const res = await getLeaderboard(top)
      setEntries(res.data.entries)
    } catch {
      // silently fail
    }
  }, [top])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, setEntries, refresh }
}
