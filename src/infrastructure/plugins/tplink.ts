import { TplinkService } from '../providers'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    tplink: TplinkService
  }
}

export default fp(async (server) => {
  const tplink = new TplinkService()
  await tplink.init()
  server.decorate('tplink', tplink)
}, '3.x')
