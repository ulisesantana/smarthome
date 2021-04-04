import { FastifyInstance } from 'fastify'
import {
  createScene, deleteSceneById,
  getSceneStatus,
  getSceneStatusById,
  toggleLightsStatusById, updateScene
} from './scene.schema'
import { SceneController } from './scene.controller'
import { container } from 'tsyringe'
import { SceneRequest } from '../domain/scene.model'
import { InternalServerError, NotFound } from 'http-errors'

export function sceneRoutes (server: FastifyInstance): void {
  const sceneController = container.resolve(SceneController)

  server.get(
    '/scene',
    { schema: getSceneStatus },
    async function (_request, reply) {
      try {
        const scenes = await sceneController.getScenes()
        reply.send(scenes)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error retrieving scenes.'))
      }
    }
  )

  server.post<{ Body: Partial<SceneRequest> }>(
    '/scene',
    { schema: createScene },
    async function ({ body }, reply) {
      try {
        const newScene = await sceneController.createScene(body)
        reply.send(newScene)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error creating scene.'))
      }
    }
  )

  server.get<{ Params: { id: string } }>(
    '/scene/:id',
    { schema: getSceneStatusById },
    async function ({ params: { id } }, reply) {
      try {
        const scene = await sceneController.getSceneById(id)
        if (scene?.id !== undefined) {
          reply.status(200)
          reply.send(scene)
        } else {
          reply.send(new NotFound(`Scene with id ${id} not found.`))
        }
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError(`Error retrieving scene with id ${id}.`))
      }
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<SceneRequest> }>(
    '/scene/:id',
    { schema: updateScene },
    async function ({ params: { id }, body }, reply) {
      try {
        const updatedScene = await sceneController.updateScene(id, body)
        if (updatedScene?.id !== undefined) {
          reply.send(updatedScene)
        } else {
          reply.send(new NotFound(`Scene with id ${id} not found.`))
        }
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error updating scene.'))
      }
    }
  )

  server.delete<{ Params: { id: string } }>(
    '/scene/:id',
    { schema: deleteSceneById },
    async function ({ params: { id } }, reply) {
      try {
        const isSceneRemoved = await sceneController.removeScene(id)
        if (isSceneRemoved) {
          reply.status(204)
        } else {
          reply.send(new NotFound(`Scene with id ${id} not found.`))
        }
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error deleting scene.'))
      }
    }
  )

  server.patch<{ Params: { id: string } }>(
    '/scene/:id/toggle',
    { schema: toggleLightsStatusById },
    async function ({ params: { id } }, reply) {
      try {
        const updatedScene = await sceneController.toggleSceneById(id)
        if (updatedScene?.id !== undefined) {
          reply.send(updatedScene)
        } else {
          reply.send(new NotFound(`Scene with id ${id} not found.`))
        }
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error toggling scene.'))
      }
    }
  )
}
