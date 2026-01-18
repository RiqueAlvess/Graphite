import { FastifyInstance } from 'fastify'
import authController from './auth.controller.js'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register.bind(authController))
  fastify.post('/login', authController.login.bind(authController))
  fastify.post('/refresh', authController.refresh.bind(authController))
  fastify.post('/logout', authController.logout.bind(authController))
}
