import { FastifyRequest, FastifyReply } from 'fastify'
import templatesService from './templates.service.js'

export class TemplatesController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userPlan = request.user?.plan

      const templates = await templatesService.getAll(userPlan)
      return reply.send(templates)
    } catch (error) {
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get templates',
      })
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const template = await templatesService.getById(request.params.id)
      return reply.send(template)
    } catch (error: any) {
      if (error.message === 'TEMPLATE_NOT_FOUND') {
        return reply.status(404).send({
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get template',
      })
    }
  }
}

export default new TemplatesController()
