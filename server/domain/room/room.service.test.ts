import { RoomService } from './room.service'
import { buildDeviceService, buildRoomEntity, buildRoom, buildDevice } from '../../common/test'
import { RoomRepository } from './room.repository'
import { DeviceService } from '../device'

describe('Room service should', () => {
  let roomRepository: RoomRepository
  let deviceService: DeviceService
  let roomService: RoomService
  beforeEach(() => {
    roomRepository = new RoomRepository()
    deviceService = buildDeviceService()
    roomService = new RoomService(deviceService, roomRepository)
  })
  describe('create a new room', () => {
    it('with given values', async () => {
      const mockId = 'noId'
      const mockRoom = buildRoomEntity({ id: mockId })
      const mockCreatedRoom = buildRoom({ ...mockRoom, devices: undefined })
      roomRepository.create = jest.fn()
      roomRepository.findById = jest.fn(async () => mockCreatedRoom)

      const createdRoom = await roomService.create(mockRoom)

      expect(createdRoom).toStrictEqual(mockCreatedRoom)
      expect(roomRepository.create).toHaveBeenCalled()
      expect(roomRepository.findById).toHaveBeenCalled()
      expect(roomRepository.findById).not.toHaveBeenCalledWith(mockId)
    })

    it('filled with default values if no values are given', async () => {
      const mockId = 'noId'
      const mockRoom = buildRoomEntity({ id: mockId })
      const mockCreatedRoom = {
        id: 'randomId',
        color: '#708090',
        devices: [],
        icon: 'self_improvement',
        name: 'NO NAME'
      }
      roomRepository.create = jest.fn()
      roomRepository.findById = jest.fn(async () => mockCreatedRoom)

      const createdRoom = await roomService.create(mockRoom)

      expect(createdRoom).toStrictEqual(mockCreatedRoom)
    })
  })

  it('retrieve all rooms in database', async () => {
    const mockedRooms = [buildRoom(), buildRoom(), buildRoom()]
    roomRepository.findAll = jest.fn(async () => mockedRooms)

    const roomsInDb = await roomService.getAll()

    expect(roomsInDb).toStrictEqual(mockedRooms)
  })

  it('retrieve room by id', async () => {
    const mockedRoom = buildRoom()
    roomRepository.findById = jest.fn(async () => mockedRoom)

    const room = await roomService.getById(mockedRoom.id)

    expect(room).toStrictEqual(mockedRoom)
    expect(roomRepository.findById).toBeCalledWith(mockedRoom.id)
  })

  it('update room', async () => {
    const mockedRoom = buildRoom()
    const updates = { name: 'Kitchen', color: 'blue' }
    const updatedRoom = { ...mockedRoom, ...updates }
    roomRepository.update = jest.fn()
    roomRepository.findById = jest.fn(async () => updatedRoom)

    const room = await roomService.update(mockedRoom.id, updates)

    expect(room).toStrictEqual(updatedRoom)
    expect(roomRepository.findById).toBeCalledWith(mockedRoom.id)
    expect(roomRepository.update).toBeCalledWith({ id: mockedRoom.id, ...updates })
  })

  it('remove room', async () => {
    const mockedRoom = buildRoom()
    roomRepository.remove = jest.fn()

    await roomService.remove(mockedRoom.id)

    expect(roomRepository.remove).toBeCalledWith(mockedRoom.id)
  })

  describe('toggle room devices by room id', () => {
    it('if any device is powered on then all will be powered off', async () => {
      const mockedRoom = buildRoom({
        devices: [
          buildDevice({ id: 'irrelevantDevice1', power: true }),
          buildDevice({ id: 'irrelevantDevice1', power: false }),
          buildDevice({ id: 'irrelevantDevice1', power: false })
        ]
      })
      const toggledRoom = {
        ...mockedRoom,
        devices: mockedRoom.devices.map(device => ({
          ...device,
          power: false
        }))
      }
      roomRepository.findById = jest.fn(async () => ({ ...mockedRoom }))
      deviceService.setLightStateById = jest.fn()

      const room = await roomService.toggleDevicesByRoomId(mockedRoom.id)

      expect(room).toStrictEqual(toggledRoom)
      expect(deviceService.setLightStateById).toHaveBeenCalledTimes(1)
    })
    it('if all devices are powered off then all will be powered on', async () => {
      const mockedRoom = buildRoom({
        devices: [
          buildDevice({ id: 'irrelevantDevice1', power: false }),
          buildDevice({ id: 'irrelevantDevice1', power: false }),
          buildDevice({ id: 'irrelevantDevice1', power: false })
        ]
      })
      const toggledRoom = {
        ...mockedRoom,
        devices: mockedRoom.devices.map(device => ({
          ...device,
          power: true
        }))
      }
      roomRepository.findById = jest.fn(async () => ({ ...mockedRoom }))
      deviceService.setLightStateById = jest.fn()

      const room = await roomService.toggleDevicesByRoomId(mockedRoom.id)

      expect(room).toStrictEqual(toggledRoom)
      expect(deviceService.setLightStateById).toHaveBeenCalledTimes(3)
    })
  })
})
