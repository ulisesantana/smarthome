import { Room, RoomEntity, RoomRequest, RoomService } from '..'
import { inject, injectable } from 'tsyringe'

@injectable()
export class RoomController {
  constructor (@inject(RoomService) private readonly roomService: RoomService) {}

  getRoomById (id: string): Promise<Room> {
    return this.roomService.getById(id)
  }

  getRooms (): Promise<Room[]> {
    return this.roomService.getAll()
  }

  createRoom (room: Partial<RoomEntity>): Promise<Room> {
    return this.roomService.create(room)
  }

  updateRoom (id: string, room: Partial<RoomRequest>): Promise<Room> {
    return this.roomService.update(id, room)
  }

  removeRoom (id: string): Promise<boolean> {
    return this.roomService.remove(id)
  }

  toggleRoomById (id: string): Promise<Room> {
    return this.roomService.toggleLightsByRoomId(id)
  }
}
