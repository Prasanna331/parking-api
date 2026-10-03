import axiosClient from './axiosClient'

export interface ParkingSpot {
  id: string
  lotId: string
  lotName: string
  spotNumber: string
  spotType: 'standard' | 'handicapped' | 'ev_charging' | 'reserved' | 'motorcycle'
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  sensorId?: string
  lastUpdated: string
}

export interface ParkingSpotPayload {
  lotId: string
  spotNumber: string
  spotType: ParkingSpot['spotType']
  status: ParkingSpot['status']
  sensorId?: string
}

export const getSpots = (lotId?: string) =>
  axiosClient.get<ParkingSpot[]>(lotId ? `/spots?lotId=${lotId}` : '/spots').then((r) => r.data)

export const createSpot = (data: ParkingSpotPayload) =>
  axiosClient.post<ParkingSpot>('/spots', data).then((r) => r.data)

export const updateSpot = (id: string, data: ParkingSpotPayload) =>
  axiosClient.put<ParkingSpot>(`/spots/${id}`, data).then((r) => r.data)

export const updateSpotStatus = (id: string, status: ParkingSpot['status']) =>
  axiosClient.patch<ParkingSpot>(`/spots/${id}/status`, { status }).then((r) => r.data)

export const deleteSpot = (id: string) =>
  axiosClient.delete(`/spots/${id}`)
