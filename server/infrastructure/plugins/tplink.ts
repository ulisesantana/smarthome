import { TplinkRepository, TplinkService } from '../providers'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    tplink: TplinkService
  }
}

export default fp(async (server) => {
  const tplinkUser = process.env.TPLINK_USER ?? ''
  const tplinkPassword = process.env.TPLINK_PASS ?? ''
  const tplink = new TplinkService(new TplinkRepository(tplinkUser, tplinkPassword))
  await tplink.init()
  server.decorate('tplink', tplink)
}, '3.x')
