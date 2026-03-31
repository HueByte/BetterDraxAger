import client from './client'

export interface LeaderboardEntry {
  rank: number
  username: string
  clicks: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}

export const getLeaderboard = (top = 10) =>
  client.get<LeaderboardResponse>('/api/leaderboard', { params: { top } })
