import { FastifyInstance } from 'fastify'
import visualsController from './visuals.controller.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { planLimiterMiddleware } from '../../middleware/planLimiter.middleware.js'

export async function visualsRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authMiddleware)

  // Create visual (with plan limiter)
  fastify.post('/', {
    preHandler: [planLimiterMiddleware],
  }, visualsController.create.bind(visualsController))

  // Read routes (no limiter)
  fastify.get('/', visualsController.getAll.bind(visualsController))
  fastify.get('/:id', visualsController.getById.bind(visualsController))
  fastify.get('/:id/export', visualsController.export.bind(visualsController))

  // Update/Delete routes (no limiter)
  fastify.patch('/:id', visualsController.update.bind(visualsController))
  fastify.delete('/:id', visualsController.delete.bind(visualsController))
}
