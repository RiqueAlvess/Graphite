import { FastifyRequest, FastifyReply } from 'fastify'
import prisma from '../lib/prisma.js'

export async function planLimiterMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user

  if (!user) {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'User not authenticated',
    })
  }

  // Premium users have no limits
  if (user.plan === 'PREMIUM') {
    return
  }

  // FREE plan: check daily limit
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

  if (count >= 1) {
    return reply.status(403).send({
      error: 'DAILY_LIMIT_REACHED',
      message: 'Você atingiu o limite de 1 visual por dia. Faça upgrade para Premium para criar ilimitados.',
      upgradeUrl: '/pricing',
    })
  }
}
