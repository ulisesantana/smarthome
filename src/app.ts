import path from 'path'
import { FastifyInstance } from 'fastify'

export default async function app (server: FastifyInstance): Promise<void> {
  await server.register(import('./plugins/tplink'))
  await server.register(import('fastify-autoload'), {
    dir: path.resolve('build/routes'),
    options: { prefix: '/api' }
  })
  await server.register(import('fastify-static'), {
    root: path.resolve('public')
  })
}
