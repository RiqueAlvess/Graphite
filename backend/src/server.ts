import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { config } from 'dotenv'

// Load environment variables
config()

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { templatesRoutes } from './modules/templates/templates.routes.js'
import { visualsRoutes } from './modules/visuals/visuals.routes.js'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  },
})

// CORS
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// API routes
fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(usersRoutes, { prefix: '/api/users' })
fastify.register(templatesRoutes, { prefix: '/api/templates' })
fastify.register(visualsRoutes, { prefix: '/api/visuals' })

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })

    console.log(`
    🚀 Server running!
    📍 URL: http://localhost:${port}
    🏥 Health: http://localhost:${port}/health
    📊 API: http://localhost:${port}/api
    `)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
