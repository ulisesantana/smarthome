import { Room, RoomRepository } from '../../src/room'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { AppBootstrap } from '../../src/app.bootstrap'
import { buildLight, buildRoom } from '../../src/common/test'
import { Light, LightRepository } from '../../src/light'

const appBootstrap = container.resolve(AppBootstrap)
appBootstrap.exec = async () => {}
container.registerInstance(AppBootstrap, appBootstrap)

describe('room endpoints', () => {
  describe('/room', () => {
    describe('GET should', () => {
      it('retrieve all rooms in database', async () => {
        const server = await buildServer()
        await setRoomCollection([
          buildRoom(),
          buildRoom(),
          buildRoom(),
          buildRoom()
        ])

        const response = await server.inject({
          url: '/room',
          method: 'GET'
        })
        await server.close()

        const rooms = response.json()
        expect(response.statusCode).toBe(200)
        expect(rooms).toHaveLength(4)
      })
      it('retrieve an empty array if there is no rooms in database', async () => {
        const server = await buildServer()
        await setRoomCollection([])

        const response = await server.inject({
          url: '/room',
          method: 'GET'
        })
        await server.close()

        const rooms = response.json()
        expect(response.statusCode).toBe(200)
        expect(rooms).toHaveLength(0)
      })
    })
    describe('POST should', () => {
      it('create a new room', async () => {
        const server = await buildServer()
        const room = buildRoom()
        await setRoomCollection([])
        await setLightCollection(room.lights)

        const response = await server.inject({
          url: '/room',
          method: 'POST',
          payload: { ...room, lights: room.lights.map(({ id }) => id) }
        })
        await server.close()

        const createdRoom = response.json()
        expect(response.statusCode).toBe(200)
        expect(createdRoom.name).toBe(room.name)
        expect(createdRoom.color).toBe(room.color)
        expect(createdRoom.icon).toBe(room.icon)
        expect(createdRoom.lights).toStrictEqual(room.lights)
      })
    })
  })

  describe('/room/:id', () => {
    describe('GET should', () => {
      it('retrieve the room based on the id', async () => {
        const server = await buildServer()
        const room = buildRoom()
        await setRoomCollection([room])
        await setLightCollection(room.lights)

        const response = await server.inject({
          url: `/room/${room.id}`,
          method: 'GET'
        })
        await server.close()

        const retrievedRoom = response.json()
        expect(response.statusCode).toBe(200)
        expect(retrievedRoom).toStrictEqual(room)
      })
      it('retrieve 404 if there is no room with the given id in database', async () => {
        const server = await buildServer()
        await setRoomCollection([])

        const response = await server.inject({
          url: '/room/irrelevantId',
          method: 'GET'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
    describe('PATCH should', () => {
      it('update the room status', async () => {
        const server = await buildServer()
        const room = buildRoom({ name: 'Bedroom', color: 'red' })
        await setRoomCollection([room])
        const update = { name: 'Kitchen', color: 'black', icon: 'kitchen' }

        const response = await server.inject({
          url: `room/${room.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        const updatedRoom = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedRoom).toStrictEqual({ ...room, ...update })
      })
      it('update the room lights', async () => {
        const server = await buildServer()
        const room = buildRoom({ lights: [buildLight(), buildLight()] })
        const newLights = [...room.lights, buildLight()]
        await setRoomCollection([room])
        await setLightCollection(newLights)
        const update = { lights: newLights.map(({ id }) => id) }

        const response = await server.inject({
          url: `room/${room.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        const updatedRoom = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedRoom).toStrictEqual({ ...room, lights: newLights })
      })
      it('return 404 if the room is not in database', async () => {
        const server = await buildServer()
        const room = buildRoom()
        await setRoomCollection([])
        const update = { name: 'Kitchen', color: 'black', icon: 'kitchen' }

        const response = await server.inject({
          url: `room/${room.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
    describe('DELETE should', () => {
      it('delete the room based on the id', async () => {
        const server = await buildServer()
        const room = buildRoom()
        await setRoomCollection([room])

        const response = await server.inject({
          url: `/room/${room.id}`,
          method: 'DELETE'
        })
        await server.close()

        expect(response.statusCode).toBe(204)
        const rooms = await container.resolve(MongoDB)
          .useCollection(RoomRepository.collection)
          .find({})
        expect(rooms).toHaveLength(0)
      })
      it('retrieve 404 if there is no room with the given id in database', async () => {
        const server = await buildServer()
        await setRoomCollection([])

        const response = await server.inject({
          url: '/room/irrelevantId',
          method: 'DELETE'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('/room/:id/toggle', () => {
    describe('PATCH should', () => {
      it('toggle the room power', async () => {
        const server = await buildServer()
        const room = buildRoom({ lights: [buildLight()] })
        await setRoomCollection([room])

        const response = await server.inject({
          url: `room/${room.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        const updatedRoom = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedRoom).toStrictEqual({
          ...room,
          lights: [{ ...room.lights[0], power: !room.lights[0].power }]
        })
      })
      it('return 404 if the room is not in database', async () => {
        const server = await buildServer()
        const room = buildRoom()
        await setRoomCollection([])

        const response = await server.inject({
          url: `room/${room.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })
})

async function setRoomCollection (rooms: Room[]): Promise<void> {
  await container.resolve(MongoDB).useCollection(RoomRepository.collection).removeCollection()
  await container.resolve(MongoDB).useCollection(LightRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _room of generateRooms(rooms)) {}
}

async function * generateRooms (rooms: Room[]) {
  const roomRepository = container.resolve(RoomRepository)
  for (const room of rooms) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
    for await (const _light of generateLights(room.lights)) {}
    await roomRepository.update({
      ...room,
      lights: room.lights.map(({ id }) => id)
    })
    yield room
  }
}

async function setLightCollection (lights: Light[]): Promise<void> {
  await container.resolve(MongoDB).useCollection(LightRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _light of generateLights(lights)) {}
}

async function * generateLights (lights: Light[]) {
  const lightRepository = container.resolve(LightRepository)
  for (const light of lights) {
    await lightRepository.upsert(light)
    yield light
  }
}
