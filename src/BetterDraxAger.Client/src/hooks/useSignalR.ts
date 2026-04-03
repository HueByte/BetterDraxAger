import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import type { LeaderboardEntry } from '../api/leaderboard'

export function useSignalR(
  onTotalUpdated: (total: number) => void,
  onLeaderboardUpdated?: (entries: LeaderboardEntry[]) => void
) {
  const totalRef = useRef(onTotalUpdated)
  totalRef.current = onTotalUpdated

  const leaderboardRef = useRef(onLeaderboardUpdated)
  leaderboardRef.current = onLeaderboardUpdated

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/age')
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('TotalUpdated', (total: number) => {
      totalRef.current(total)
    })

    connection.on('LeaderboardUpdated', (entries: LeaderboardEntry[]) => {
      leaderboardRef.current?.(entries)
    })

    async function start() {
      try {
        await connection.start()
      } catch {
        setTimeout(start, 5000)
      }
    }

    connection.onreconnecting(() => console.warn('[SignalR] Reconnecting...'))
    connection.onreconnected(() => console.info('[SignalR] Reconnected.'))
    connection.onclose(() => {
      console.warn('[SignalR] Connection closed. Retrying in 5s...')
      setTimeout(start, 5000)
    })

    start()

    return () => {
      connection.stop()
    }
  }, [])
}
