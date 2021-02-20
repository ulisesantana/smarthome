import path from 'path'
import { FastifyInstance } from 'fastify'

export default async function app (server: FastifyInstance): Promise<void> {
  await Promise.all([
    server.register(import('./plugins/lifx')),
    server.register(import('./plugins/tplink')),
    server.register(import('fastify-cors')),
    server.register(import('fastify-autoload'), {
      dir: path.resolve('build/routes'),
      options: { prefix: '/api' }
    }),
    server.register(import('fastify-static'), {
      root: path.resolve('public')
    })
  ])
}
