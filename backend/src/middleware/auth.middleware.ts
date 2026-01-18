import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken } from '../lib/jwt.js'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'No authorization header',
      })
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      const payload = verifyAccessToken(token)

      // Attach user to request
      request.user = {
        id: payload.userId,
        email: payload.email,
        plan: payload.plan,
      }
    } catch (error) {
      return reply.status(401).send({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      })
    }
  } catch (error) {
    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message: 'Authentication error',
    })
  }
}
