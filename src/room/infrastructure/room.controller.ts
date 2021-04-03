import { Room, RoomEntity, RoomService } from '..'
import { inject, injectable } from 'tsyringe'

@injectable()
export class RoomController {
  constructor (@inject(RoomService) private readonly roomService: RoomService) {}

  async getRoomById (id: string): Promise<Room> {
    return this.roomService.getById(id)
  }

  getRooms (): Promise<Room[]> {
    return this.roomService.getAll()
  }

  async createRoom (room: Partial<RoomEntity>): Promise<Room> {
    return this.roomService.create(room)
  }

  updateRoom (id: string, room: Partial<Room>): Promise<Room> {
    return this.roomService.update(id, room)
  }

  async removeRoom (id: string): Promise<void> {
    await this.roomService.remove(id)
  }

  async toggleRoomById (id: string): Promise<Room[]> {
    await this.roomService.toggleDevicesByRoomId(id)
    return this.getRooms()
  }
}
