import { create } from 'zustand'
import apiClient from '@/lib/api/client'
import type { User, AuthResponse, PlanLimits } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  getPlanLimits: () => Promise<PlanLimits>
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      })

      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        name,
      })

      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      const response = await apiClient.get<User>('/users/me')
      set({
        user: response.data,
        isAuthenticated: true,
      })
    } catch (error) {
      set({ isAuthenticated: false, user: null })
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  getPlanLimits: async () => {
    const response = await apiClient.get<PlanLimits>('/users/me/limits')
    return response.data
  },
}))
