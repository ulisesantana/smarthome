import { Room, RoomEntity, RoomRequest } from './room.model'
import { RoomRepository } from './room.repository'
import { generateId } from '../../common'
import { Light, LightService } from '../../light'
import { inject, injectable } from 'tsyringe'

@injectable()
export class RoomService {
  constructor (
        @inject(LightService) private readonly lightService: LightService,
        @inject(RoomRepository) private readonly repository: RoomRepository
  ) {}

  async create (room: Partial<RoomRequest> = {}): Promise<Room> {
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

  async update (id: string, room: Partial<RoomRequest>): Promise<Room> {
    await this.repository.update({ ...room, id })
    return this.getById(id)
  }

  async remove (id: string): Promise<void> {
    await this.repository.remove(id)
  }

  async toggleLightsByRoomId (id: string): Promise<Room> {
    const room = await this.getById(id)
    const updatedLights = []
    for await (const light of this.toggleLights(room.lights)) {
      updatedLights.push(light)
    }
    room.lights = updatedLights
    return room
  }

  private async * toggleLights (lights: Light[]): AsyncGenerator<Light> {
    const newRoomPowerState = !RoomService.anyLightIsPoweredUp(lights)
    for (const light of lights) {
      if (light.power !== newRoomPowerState) {
        await this.lightService.toggleLightById(light.id)
        light.power = !light.power
      }
      yield light
    }
  }

  private static anyLightIsPoweredUp (lights: Light[]): boolean {
    return lights.some(({ power }) => power)
  }
}
