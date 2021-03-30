import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, updateLightStatusById } from './schema'
import {
  Device,
  DeviceRepository,
  DeviceService
} from '../../../domain'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from '../../providers'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const deviceRepository = new DeviceRepository()
  const [tplinkService, lifxService] = await Promise.all([
    loadTplinkService(deviceRepository),
    loadLifxService(deviceRepository)
  ])

  const deviceService = new DeviceService({
    deviceRepository,
    lifxService,
    tplinkService
  })

  server.get('/', { schema: getLightStatus },
    async function () {
      return await deviceService.getDevices()
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<Device> }>('/:id', { schema: updateLightStatusById },
    async function ({ params, body }) {
      return await deviceService.setLightStateById(params.id, body)
    }
  )

  server.patch<{ Params: { id: string } }>('/toggle/:id', { schema: toggleLightById },
    async function ({ params }) {
      return await deviceService.toggleDeviceById(params.id)
    }
  )
}

async function loadLifxService (deviceRepository: DeviceRepository): Promise<LifxService> {
  const lifxToken = process.env.LIFX_TOKEN ?? ''
  const lifx = new LifxService(new LifxRepository(lifxToken), deviceRepository)
  await lifx.init()
  return lifx
}

async function loadTplinkService (deviceRepository: DeviceRepository): Promise<TplinkService> {
  const tplinkUser = process.env.TPLINK_USER ?? ''
  const tplinkPassword = process.env.TPLINK_PASS ?? ''
  const tplink = new TplinkService(new TplinkRepository(tplinkUser, tplinkPassword), deviceRepository)
  await tplink.init()
  return tplink
}

export default lightsAPI
