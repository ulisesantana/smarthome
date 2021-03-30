import fp from 'fastify-plugin'
import { LifxService, LifxRepository } from '../providers'

declare module 'fastify' {
  interface FastifyInstance {
    lifx: LifxService
  }
}

export default fp(async (server) => {
  const lifxToken = process.env.LIFX_TOKEN ?? ''
  const lifx = new LifxService(new LifxRepository(lifxToken))
  await lifx.init()
  server.decorate('lifx', lifx)
}, '3.x')
