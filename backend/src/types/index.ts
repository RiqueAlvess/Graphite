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

// User type matching Prisma schema
export interface User {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PREMIUM'
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface PlanLimits {
  dailyVisualsLimit: number
  dailyVisualsCreated: number
  canCreateVisual: boolean
  isPremium: boolean
}
