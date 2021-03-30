import path from 'path'
import { FastifyInstance } from 'fastify'

export default async function app (server: FastifyInstance): Promise<void> {
  await Promise.all([
    server.register(import('./infrastructure/plugins/lifx')),
    server.register(import('./infrastructure/plugins/tplink')),
    server.register(import('fastify-cors')),
    server.register(import('fastify-autoload'), {
      dir: path.resolve('build/infrastructure/routes'),
      options: { prefix: '/api' }
    }),
    server.register(import('fastify-static'), {
      root: path.resolve('client')
    })
  ])
}
