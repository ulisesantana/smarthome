import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, updateLightStatusById } from './light.schema'
import { Light, LightController } from '../'
import { container } from 'tsyringe'

export function lightRoutes (server: FastifyInstance): void {
  const lightsController = container.resolve(LightController)

  server.get('/light', { schema: getLightStatus },
    async function () {
      return await lightsController.getDevices()
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<Light> }>('/light/:id', { schema: updateLightStatusById },
    async function ({ params, body }) {
      return await lightsController.setLightStateById(params.id, body)
    }
  )

  server.patch<{ Params: { id: string } }>('/light/:id/toggle', { schema: toggleLightById },
    async function ({ params }) {
      return await lightsController.toggleDeviceById(params.id)
    }
  )
}
