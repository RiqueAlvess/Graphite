import { FastifyInstance } from 'fastify'
import usersController from './users.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

export async function usersRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authMiddleware)

  fastify.get('/me', usersController.getMe.bind(usersController))
  fastify.get('/me/limits', usersController.getPlanLimits.bind(usersController))
  fastify.patch('/me', usersController.updateMe.bind(usersController))
}
