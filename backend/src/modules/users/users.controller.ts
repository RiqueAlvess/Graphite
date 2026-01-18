import { FastifyRequest, FastifyReply } from 'fastify'
import usersService from './users.service.js'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
})

export class UsersController {
  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const user = await usersService.getMe(userId)
      return reply.send(user)
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get user',
      })
    }
  }

  async getPlanLimits(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const limits = await usersService.getPlanLimits(userId)
      return reply.send(limits)
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get plan limits',
      })
    }
  }

  async updateMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const body = updateSchema.parse(request.body)

      const user = await usersService.updateMe(userId, body)
      return reply.send(user)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors,
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to update user',
      })
    }
  }
}

export default new UsersController()
