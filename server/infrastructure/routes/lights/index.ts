import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, updateLightStatusById } from './schema'
import {
  Device,
  DeviceRepository,
  DeviceService
} from '../../../domain'
import { BootstrapLightsService } from '../../bootstrapLights.service'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const deviceRepository = new DeviceRepository()
  const bootstrapLightsService = new BootstrapLightsService(deviceRepository)
  const { tplinkService, lifxService } = await bootstrapLightsService.init()

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

export default lightsAPI
