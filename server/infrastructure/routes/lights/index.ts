import { FastifyInstance } from 'fastify'
import { getLightStatus, getRoomStatus, getRoomStatusById, toggleLightById, updateLightStatusById } from './schema'
import {
  Device, LightsController
} from '../../../domain'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const lightsController = await LightsController.build()

  server.get('/', { schema: getLightStatus },
    async function () {
      return await lightsController.getDevices()
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<Device> }>('/:id', { schema: updateLightStatusById },
    async function ({ params, body }) {
      return await lightsController.setLightStateById(params.id, body)
    }
  )

  server.patch<{ Params: { id: string } }>('/:id/toggle', { schema: toggleLightById },
    async function ({ params }) {
      return await lightsController.toggleDeviceById(params.id)
    }
  )

  server.get('/rooms', { schema: getRoomStatus },
    async function () {
      return await lightsController.getRooms()
    }
  )
  server.get<{ Params: { id: string } }>('/rooms/:id', { schema: getRoomStatusById },
    async function ({ params: { id } }) {
      return await lightsController.getRoomById(id)
    }
  )
}

export default lightsAPI
