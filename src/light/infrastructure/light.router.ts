import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, updateLightStatusById } from './light.schema'
import { Light, LightController } from '../'
import { container } from 'tsyringe'
import { InternalServerError } from 'http-errors'

export function lightRoutes (server: FastifyInstance): void {
  const lightsController = container.resolve(LightController)

  server.get(
    '/light',
    { schema: getLightStatus },
    async function (_request, reply) {
      try {
        const lights = await lightsController.getLights()
        reply.send(lights)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error retrieving lights.'))
      }
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<Light> }>(
    '/light/:id',
    { schema: updateLightStatusById },
    async function ({ params: { id }, body }, reply) {
      try {
        const updatedLight = await lightsController.setLightStateById(id, body)
        reply.send(updatedLight)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError(`Error updating light with id ${id}.`))
      }
    }
  )

  server.patch<{ Params: { id: string } }>(
    '/light/:id/toggle',
    { schema: toggleLightById },
    async function ({ params: { id } }, reply) {
      try {
        const updatedLight = await lightsController.toggleLightById(id)
        reply.send(updatedLight)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError(`Error toggling light with id ${id}.`))
      }
    }
  )
}
