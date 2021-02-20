import fp from 'fastify-plugin'
import { LifxService } from '../services'

declare module 'fastify' {
  interface FastifyInstance {
    lifx: LifxService
  }
}

export default fp(async (server) => {
  const lifx = new LifxService()
  await lifx.init()
  server.decorate('lifx', lifx)
}, '3.x')
