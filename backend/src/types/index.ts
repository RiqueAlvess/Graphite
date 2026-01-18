import { User } from '@prisma/client'

// Extend Fastify Request to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      plan: 'FREE' | 'PREMIUM'
    }
  }
}

export interface JWTPayload {
  userId: string
  email: string
  plan: 'FREE' | 'PREMIUM'
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  accessToken: string
  refreshToken: string
}

export interface PlanLimits {
  dailyVisualsLimit: number
  dailyVisualsCreated: number
  canCreateVisual: boolean
  isPremium: boolean
}
