import { create } from 'zustand'

interface AuthState {
  token: string | null
  email: string | null
  role: string | null
  setAuth: (token: string, email: string, role: string) => void
  clearAuth: () => void
}

// Simple in-memory store (token persisted to localStorage manually)
export const useAuthStore = create<AuthState>()((set) => ({
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  role: localStorage.getItem('role'),
  setAuth: (token, email, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('email', email)
    localStorage.setItem('role', role)
    set({ token, email, role })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    set({ token: null, email: null, role: null })
  },
}))
