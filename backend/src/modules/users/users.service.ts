import prisma from '../../lib/prisma.js'
import type { PlanLimits } from '../../types/index.js'

export class UsersService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return user
  }

  async getPlanLimits(userId: string): Promise<PlanLimits> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    const isPremium = user.plan === 'PREMIUM'

    if (isPremium) {
      return {
        dailyVisualsLimit: -1, // Unlimited
        dailyVisualsCreated: 0,
        canCreateVisual: true,
        isPremium: true,
      }
    }

    // FREE plan: count visuals created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const count = await prisma.visual.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
    })

    return {
      dailyVisualsLimit: 1,
      dailyVisualsCreated: count,
      canCreateVisual: count < 1,
      isPremium: false,
    }
  }

  async updateMe(userId: string, data: { name?: string; email?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }
}

export default new UsersService()
