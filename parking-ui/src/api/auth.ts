import axiosClient from './axiosClient'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; role?: string }
export interface AuthResponse { token: string; email: string; role: string }

export const login = (data: LoginPayload) =>
  axiosClient.post<AuthResponse>('/auth/login', data).then((r) => r.data)

export const register = (data: RegisterPayload) =>
  axiosClient.post<AuthResponse>('/auth/register', data).then((r) => r.data)

export const getMe = () =>
  axiosClient.get<{ id: string; name: string; email: string; role: string }>('/auth/me').then((r) => r.data)
