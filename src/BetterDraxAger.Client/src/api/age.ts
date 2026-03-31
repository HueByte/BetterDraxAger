import client from './client'

export interface ClickResponse {
  newTotal: number
  yourTotal: number
}

export interface TotalResponse {
  total: number
}

export const getTotal = () => client.get<TotalResponse>('/api/age/total')
export const click = () => client.post<ClickResponse>('/api/age/click')
