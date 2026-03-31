import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

export function useSignalR(onTotalUpdated: (total: number) => void) {
  const callbackRef = useRef(onTotalUpdated)
  callbackRef.current = onTotalUpdated

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/age')
      .withAutomaticReconnect()
      .build()

    connection.on('TotalUpdated', (total: number) => {
      callbackRef.current(total)
    })

    connection.start().catch(console.error)

    return () => {
      connection.stop()
    }
  }, [])
}
