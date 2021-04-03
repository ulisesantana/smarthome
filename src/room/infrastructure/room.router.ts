import { FastifyInstance } from 'fastify'
import { getRoomStatus, getRoomStatusById } from './room.schema'
import { RoomController } from './room.controller'
import { container } from 'tsyringe'

export function roomRoutes (server: FastifyInstance): void {
  const roomController = container.resolve(RoomController)

  server.get('/rooms', { schema: getRoomStatus },
    async function () {
      return await roomController.getRooms()
    }
  )
  server.get<{ Params: { id: string } }>('/rooms/:id', { schema: getRoomStatusById },
    async function ({ params: { id } }) {
      return await roomController.getRoomById(id)
    }
  )
}
