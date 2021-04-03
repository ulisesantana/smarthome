import { RoomService } from './room.service'
import { buildRoomEntity, buildRoom, buildLight } from '../../common/test'
import { RoomRepository } from './room.repository'
import { LightService } from '../../light'
import { container } from 'tsyringe'
import { Room } from './room.model'

type MockRepositoriesParams = Partial<{
    findById: Room,
    findAll: Room[],
}>

describe('Room service should', () => {
  let roomRepository: RoomRepository
  let lightService: LightService
  let mockRepository: Function

  beforeEach(() => {
    container.clearInstances()
    roomRepository = container.resolve(RoomRepository)
    lightService = container.resolve(LightService)
    lightService.toggleLightById = jest.fn()
    roomRepository.create = jest.fn()
    roomRepository.update = jest.fn()
    roomRepository.remove = jest.fn()

    mockRepository = ({
      findById, findAll
    }: MockRepositoriesParams) => {
      roomRepository.findById = jest.fn(async () => findById || {} as Room)
      roomRepository.findAll = jest.fn(async () => findAll || [] as Room[])
    }
  })
  describe('create a new room', () => {
    it('with given values', async () => {
      const mockId = 'noId'
      const mockRoom = buildRoomEntity({ id: mockId })
      const expectedRoom = buildRoom({ ...mockRoom, lights: [buildLight({ id: 'irrelevantLightId' })] })
      lightService.getLightsById = jest.fn(async () => [expectedRoom.lights[0]])

      const createdRoom = await new RoomService(lightService, roomRepository).create(mockRoom)

      expect(createdRoom.color).toBe(expectedRoom.color)
      expect(createdRoom.icon).toBe(expectedRoom.icon)
      expect(createdRoom.name).toBe(expectedRoom.name)
      expect(createdRoom.lights).toStrictEqual(expectedRoom.lights)
      expect(roomRepository.create).toHaveBeenCalled()
    })

    it('filled with default values if no values are given', async () => {
      lightService.getLightsById = jest.fn(async () => [])
      const defaultRoomValues = {
        color: '#708090',
        lights: [],
        icon: 'self_improvement',
        name: 'NO NAME'
      }

      const createdRoom = await new RoomService(lightService, roomRepository).create()

      expect(createdRoom.color).toBe(defaultRoomValues.color)
      expect(createdRoom.icon).toBe(defaultRoomValues.icon)
      expect(createdRoom.name).toBe(defaultRoomValues.name)
      expect(createdRoom.lights).toStrictEqual(defaultRoomValues.lights)
    })
  })

  it('retrieve all rooms in database', async () => {
    const mockedRooms = [buildRoom(), buildRoom(), buildRoom()]
    mockRepository({ findAll: mockedRooms })

    const roomsInDb = await new RoomService(lightService, roomRepository).getAll()

    expect(roomsInDb).toStrictEqual(mockedRooms)
  })

  it('retrieve room by id', async () => {
    const mockedRoom = buildRoom()
    mockRepository({ findById: mockedRoom })

    const room = await new RoomService(lightService, roomRepository).getById(mockedRoom.id)

    expect(room).toStrictEqual(mockedRoom)
    expect(roomRepository.findById).toBeCalledWith(mockedRoom.id)
  })

  it('update a room and return it', async () => {
    const mockedRoom = buildRoom()
    const updates = { name: 'Kitchen', color: 'blue' }
    const updatedRoom = { ...mockedRoom, ...updates }
    roomRepository.update = jest.fn()
    mockRepository({ findById: updatedRoom })

    const room = await new RoomService(lightService, roomRepository).update(mockedRoom.id, updates)

    expect(room).toStrictEqual(updatedRoom)
    expect(roomRepository.findById).toBeCalledWith(mockedRoom.id)
    expect(roomRepository.update).toBeCalledWith({ id: mockedRoom.id, ...updates })
  })

  it('remove room', async () => {
    const mockedRoom = buildRoom()

    await new RoomService(lightService, roomRepository).remove(mockedRoom.id)

    expect(roomRepository.remove).toBeCalledWith(mockedRoom.id)
  })

  describe('toggle room devices by room id', () => {
    it('if any device is powered on then all will be powered off', async () => {
      const mockedRoom = buildRoom({
        lights: [
          buildLight({ id: 'irrelevantDevice1', power: true }),
          buildLight({ id: 'irrelevantDevice2', power: false }),
          buildLight({ id: 'irrelevantDevice3', power: false })
        ]
      })
      const toggledRoom: Room = {
        ...mockedRoom,
        lights: mockedRoom.lights.map(light => ({
          ...light,
          power: false
        }))
      }
      mockRepository({ findById: { ...mockedRoom } })

      const room = await new RoomService(lightService, roomRepository).toggleLightsByRoomId(mockedRoom.id)

      expect(room).toStrictEqual(toggledRoom)
      expect(lightService.toggleLightById).toHaveBeenCalledTimes(1)
    })
    it('if all devices are powered off then all will be powered on', async () => {
      const mockedRoom = buildRoom({
        lights: [
          buildLight({ id: 'irrelevantDevice1', power: false }),
          buildLight({ id: 'irrelevantDevice2', power: false }),
          buildLight({ id: 'irrelevantDevice3', power: false })
        ]
      })
      const toggledRoom: Room = {
        ...mockedRoom,
        lights: mockedRoom.lights.map(light => ({
          ...light,
          power: true
        }))
      }
      mockRepository({ findById: { ...mockedRoom } })

      const room = await new RoomService(lightService, roomRepository).toggleLightsByRoomId(mockedRoom.id)

      expect(room).toStrictEqual(toggledRoom)
      expect(lightService.toggleLightById).toHaveBeenCalledTimes(3)
    })
  })
})
