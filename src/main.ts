import Fastify from 'fastify'
import { handler } from '../lambda/invoices/create/index'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.post('/invoices/create', (request, reply) => handler)

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}