import { Room, RoomEntity } from './room.model'
import { RoomRepository } from './room.repository'
import { generateId } from '../../common'
import { LightService } from '../../light'
import { inject, injectable } from 'tsyringe'

@injectable()
export class RoomService {
  constructor (
        @inject(LightService) private readonly lightService: LightService,
        @inject(RoomRepository) private readonly repository: RoomRepository
  ) {}

  async create (room: Partial<RoomEntity> = {}): Promise<Room> {
    const newRoom: RoomEntity = {
      id: generateId(),
      color: room.color ?? '#708090',
      lights: room.lights ?? [],
      icon: room.icon ?? 'self_improvement',
      name: room.name ?? 'NO NAME'
    }
    await this.repository.create(newRoom)
    const lights = await this.lightService.getLightsById(newRoom.lights)
    return {
      ...newRoom,
      lights
    }
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
    const someDeviceIsPoweredUp = room.lights.some(({ power }) => power)
    const newPowerState = !someDeviceIsPoweredUp
    // FIXME Don't await in a loop
    for (const device of room.lights) {
      if (device.power !== newPowerState) {
        await this.lightService.setLightStateById(device.id, { power: newPowerState })
        device.power = newPowerState
      }
    }
    return room
  }
}
