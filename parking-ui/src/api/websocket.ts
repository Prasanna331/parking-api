import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useRef } from 'react'
import { ParkingSpot } from './spots'

/**
 * Subscribes to real-time spot updates for a given lotId.
 * Calls onUpdate whenever a spot status changes.
 */
export function useSpotWebSocket(
  lotId: string | undefined,
  onUpdate: (spot: ParkingSpot) => void
) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!lotId) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/spots/${lotId}`, (message: IMessage) => {
          const spot: ParkingSpot = JSON.parse(message.body)
          onUpdate(spot)
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [lotId])
}
