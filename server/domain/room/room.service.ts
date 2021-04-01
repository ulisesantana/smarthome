import { Room, RoomEntity } from './room.model'
import { RoomRepository } from './room.repository'
import { generateId } from '../../common'
import { DeviceService } from '../device'

export class RoomService {
  constructor (
        private readonly deviceService: DeviceService,
        private readonly repository = new RoomRepository()
  ) {
  }

  async create (room: Partial<RoomEntity>): Promise<Room> {
    const newRoom: RoomEntity = {
      id: generateId(),
      color: room.color ?? '#708090',
      devices: room.devices ?? [],
      icon: room.icon ?? 'self_improvement',
      name: room.name ?? 'NO NAME'
    }
    await this.repository.create(newRoom)
    return this.getById(newRoom.id)
  }

  async getById (id: string): Promise<Room> {
    return this.repository.findById(id)
  }

  async getAll (): Promise<Room[]> {
    return this.repository.findAll()
  }

  async update (id: string, room: Partial<Room>): Promise<Room> {
    await this.repository.update({ ...room, id })
    return this.getById(id)
  }

  async remove (id: string): Promise<void> {
    await this.repository.remove(id)
  }

  async toggleDevicesByRoomId (id: string): Promise<Room> {
    const room = await this.getById(id)
    const someDeviceIsPoweredUp = room.devices.some(({ power }) => power)
    const newPowerState = !someDeviceIsPoweredUp
    for (const device of room.devices) {
      if (device.power !== newPowerState) {
        await this.deviceService.setLightStateById(device.id, { power: newPowerState })
        device.power = newPowerState
      }
    }
    return room
  }
}
