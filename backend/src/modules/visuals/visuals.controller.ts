import { FastifyRequest, FastifyReply } from 'fastify'
import visualsService from './visuals.service.js'
import { z } from 'zod'

const createSchema = z.object({
  templateId: z.string(),
})

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  styleConfig: z.any().optional(),
  spec: z.any().optional(),
  userData: z.any().optional(),
  status: z.enum(['DRAFT', 'COMPLETED']).optional(),
})

export class VisualsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const body = createSchema.parse(request.body)

      const visual = await visualsService.create(userId, body.templateId)
      return reply.status(201).send(visual)
    } catch (error: any) {
      if (error.message === 'TEMPLATE_NOT_FOUND') {
        return reply.status(404).send({
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found',
        })
      }

      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to create visual',
      })
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const visuals = await visualsService.getAll(userId)
      return reply.send(visuals)
    } catch (error) {
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get visuals',
      })
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const visual = await visualsService.getById(request.params.id, userId)
      return reply.send(visual)
    } catch (error: any) {
      if (error.message === 'VISUAL_NOT_FOUND') {
        return reply.status(404).send({
          error: 'VISUAL_NOT_FOUND',
          message: 'Visual not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to get visual',
      })
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const body = updateSchema.parse(request.body)

      const visual = await visualsService.update(request.params.id, userId, body)
      return reply.send(visual)
    } catch (error: any) {
      if (error.message === 'VISUAL_NOT_FOUND') {
        return reply.status(404).send({
          error: 'VISUAL_NOT_FOUND',
          message: 'Visual not found',
        })
      }

      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors,
        })
      }

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to update visual',
      })
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      await visualsService.delete(request.params.id, userId)
      return reply.send({ message: 'Visual deleted successfully' })
    } catch (error: any) {
      if (error.message === 'VISUAL_NOT_FOUND') {
        return reply.status(404).send({
          error: 'VISUAL_NOT_FOUND',
          message: 'Visual not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to delete visual',
      })
    }
  }

  async export(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user!.id
      const denebJSON = await visualsService.exportToDeneb(request.params.id, userId)
      return reply.send(denebJSON)
    } catch (error: any) {
      if (error.message === 'VISUAL_NOT_FOUND') {
        return reply.status(404).send({
          error: 'VISUAL_NOT_FOUND',
          message: 'Visual not found',
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Failed to export visual',
      })
    }
  }
}

export default new VisualsController()
