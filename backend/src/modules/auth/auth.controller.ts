import { FastifyRequest, FastifyReply } from 'fastify'
import authService from './auth.service.js'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = registerSchema.parse(request.body)

      const result = await authService.register(
        body.email,
        body.password,
        body.name
      )

      return reply.status(201).send(result)
    } catch (error: any) {
      if (error.message === 'EMAIL_EXISTS') {
        return reply.status(409).send({
          error: 'EMAIL_EXISTS',
          message: 'Email already registered',
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
        message: 'Registration failed',
      })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = loginSchema.parse(request.body)

      const result = await authService.login(body.email, body.password)

      return reply.send(result)
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return reply.status(401).send({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
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
        message: 'Login failed',
      })
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = refreshSchema.parse(request.body)

      const result = await authService.refreshAccessToken(body.refreshToken)

      return reply.send(result)
    } catch (error: any) {
      if (error.message === 'INVALID_REFRESH_TOKEN' || error.message === 'REFRESH_TOKEN_EXPIRED') {
        return reply.status(401).send({
          error: error.message,
          message: 'Invalid or expired refresh token',
        })
      }

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Token refresh failed',
      })
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = refreshSchema.parse(request.body)

      await authService.logout(body.refreshToken)

      return reply.send({ message: 'Logged out successfully' })
    } catch (error) {
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Logout failed',
      })
    }
  }
}

export default new AuthController()
