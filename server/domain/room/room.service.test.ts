import { RoomService } from './room.service'
import { buildDeviceService, buildRoomEntity, buildRoom } from '../../common/test'
import { RoomRepository } from './room.repository'

describe('Room service should', () => {
  describe('create a new room', () => {
    it('with given values', async () => {
      const mockId = 'noId'
      const mockRoom = buildRoomEntity({ id: mockId })
      const mockCreatedRoom = buildRoom({ ...mockRoom, devices: undefined })
      const roomRepository = new RoomRepository()
      roomRepository.create = jest.fn()
      roomRepository.findById = jest.fn(async () => mockCreatedRoom)
      const roomService = new RoomService(
        buildDeviceService(),
        roomRepository
      )

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
      const roomRepository = new RoomRepository()
      roomRepository.create = jest.fn()
      roomRepository.findById = jest.fn(async () => mockCreatedRoom)
      const roomService = new RoomService(
        buildDeviceService(),
        roomRepository
      )

      const createdRoom = await roomService.create(mockRoom)

      expect(createdRoom.color).toBe(mockCreatedRoom.color)
      expect(createdRoom.icon).toBe(mockCreatedRoom.icon)
      expect(createdRoom.name).toBe(mockCreatedRoom.name)
      expect(createdRoom.devices).toStrictEqual(mockCreatedRoom.devices)
    })
  })
  it.todo('retrieve all rooms in database')
  it.todo('retrieve room by id')
  it.todo('update room')
  it.todo('remove room')
  it.todo('toggle room devices')
})
