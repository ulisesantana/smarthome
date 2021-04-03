import { FastifyInstance } from 'fastify'
import {
  createRoom, deleteRoomById,
  getRoomStatus,
  getRoomStatusById,
  toggleLightsStatusById, updateRoom
} from './room.schema'
import { RoomController } from './room.controller'
import { container } from 'tsyringe'
import { RoomRequest } from '../domain/room.model'
import { InternalServerError, NotFound } from 'http-errors'

export function roomRoutes (server: FastifyInstance): void {
  const roomController = container.resolve(RoomController)

  server.get(
    '/room',
    { schema: getRoomStatus },
    async function (_request, reply) {
      try {
        const rooms = await roomController.getRooms()
        reply.send(rooms)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error retrieving rooms.'))
      }
    }
  )

  server.post<{ Body: Partial<RoomRequest> }>(
    '/room',
    { schema: createRoom },
    async function ({ body }, reply) {
      try {
        const newRoom = await roomController.createRoom(body)
        reply.send(newRoom)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error creating room.'))
      }
    }
  )

  server.get<{ Params: { id: string } }>(
    '/room/:id',
    { schema: getRoomStatusById },
    async function ({ params: { id } }, reply) {
      try {
        const room = await roomController.getRoomById(id)
        if (room?.id !== undefined) {
          reply.status(200)
          reply.send(room)
        } else {
          reply.send(new NotFound(`Room with id ${id} not found.`))
        }
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError(`Error retrieving room with id ${id}.`))
      }
    }
  )

  server.patch<{ Params: { id: string }, Body: Partial<RoomRequest> }>(
    '/room/:id',
    { schema: updateRoom },
    async function ({ params: { id }, body }, reply) {
      try {
        const updatedRoom = await roomController.updateRoom(id, body)
        reply.send(updatedRoom)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error updating room.'))
      }
    }
  )

  server.delete<{ Params: { id: string } }>(
    '/room/:id',
    { schema: deleteRoomById },
    async function ({ params: { id } }, reply) {
      try {
        await roomController.removeRoom(id)
        reply.status(204)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error deleting room.'))
      }
    }
  )

  server.patch<{ Params: { id: string } }>(
    '/room/:id/toggle',
    { schema: toggleLightsStatusById },
    async function ({ params: { id } }, reply) {
      try {
        const updatedRoom = await roomController.toggleRoomById(id)
        reply.send(updatedRoom)
      } catch (err) {
        console.error(err.toString())
        reply.send(new InternalServerError('Error toggling room.'))
      }
    }
  )
}
