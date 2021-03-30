import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, updateLightStatusById } from './schema'
import {
  Device, DeviceController
} from '../../../domain'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const deviceController = await DeviceController.build()

  server.get('/', { schema: getLightStatus },
    async function () {
      return await deviceController.getDevices()
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<Device> }>('/:id', { schema: updateLightStatusById },
    async function ({ params, body }) {
      return await deviceController.setLightStateById(params.id, body)
    }
  )

  server.patch<{ Params: { id: string } }>('/toggle/:id', { schema: toggleLightById },
    async function ({ params }) {
      return await deviceController.toggleDeviceById(params.id)
    }
  )
}

export default lightsAPI
