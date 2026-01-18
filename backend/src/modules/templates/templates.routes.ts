import { FastifyInstance } from 'fastify'
import templatesController from './templates.controller.js'

export async function templatesRoutes(fastify: FastifyInstance) {
  fastify.get('/', templatesController.getAll.bind(templatesController))
  fastify.get('/:id', templatesController.getById.bind(templatesController))
}
