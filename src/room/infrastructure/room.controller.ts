import { Room, RoomEntity, RoomRequest, RoomService } from '..'
import { inject, injectable } from 'tsyringe'
import { Light } from '../../light'

export interface RoomResponse {
  id: string
  name: string
  color: string
  icon: string
  lights: Light[]
}

@injectable()
export class RoomController {
  constructor (@inject(RoomService) private readonly roomService: RoomService) {}

  async getRoomById (id: string): Promise<RoomResponse> {
    return RoomController.mapToJSON(await this.roomService.getById(id))
  }

  async getRooms (): Promise<RoomResponse[]> {
    const rooms = await this.roomService.getAll()
    return rooms.map(RoomController.mapToJSON)
  }

  async createRoom (room: Partial<RoomEntity>): Promise<RoomResponse> {
    return RoomController.mapToJSON(await this.roomService.create(room))
  }

  async updateRoom (id: string, room: Partial<RoomRequest>): Promise<RoomResponse> {
    return RoomController.mapToJSON(await this.roomService.update(id, room))
  }

  removeRoom (id: string): Promise<boolean> {
    return this.roomService.remove(id)
  }

  async toggleRoomById (id: string): Promise<RoomResponse> {
    return RoomController.mapToJSON(await this.roomService.toggleLightsByRoomId(id))
  }

  private static mapToJSON (room: Room): RoomResponse {
    return {
      color: room.color,
      icon: room.icon,
      id: room.id,
      lights: room.lights.getAll(),
      name: room.name
    }
  }
}
