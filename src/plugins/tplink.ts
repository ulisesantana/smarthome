import { TplinkController } from '../controllers/tplink.controller'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    tplink: TplinkController
  }
}

export default fp(async (server) => {
  const tplink = new TplinkController()
  await tplink.init()
  server.decorate('tplink', tplink)
}, '3.x')
