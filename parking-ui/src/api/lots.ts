import axiosClient from './axiosClient'

export interface ParkingLot {
  id: string
  name: string
  address: string
  city: string
  totalSpots: number
  isActive: boolean
}

export interface ParkingLotPayload {
  name: string
  address: string
  city: string
  isActive?: boolean
}

export const getLots = () =>
  axiosClient.get<ParkingLot[]>('/lots').then((r) => r.data)

export const getLot = (id: string) =>
  axiosClient.get<ParkingLot>(`/lots/${id}`).then((r) => r.data)

export const createLot = (data: ParkingLotPayload) =>
  axiosClient.post<ParkingLot>('/lots', data).then((r) => r.data)

export const updateLot = (id: string, data: ParkingLotPayload) =>
  axiosClient.put<ParkingLot>(`/lots/${id}`, data).then((r) => r.data)

export const deleteLot = (id: string) =>
  axiosClient.delete(`/lots/${id}`)
