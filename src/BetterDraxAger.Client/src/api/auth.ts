import client from './client'

export interface AuthResponse {
  token: string
  username: string
  expiresAt: string
}

export interface ErrorResponse {
  errors: string[]
}

export const register = (username: string, password: string) =>
  client.post<AuthResponse>('/api/auth/register', { username, password })

export const login = (username: string, password: string) =>
  client.post<AuthResponse>('/api/auth/login', { username, password })
