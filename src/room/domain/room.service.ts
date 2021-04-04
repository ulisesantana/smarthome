import { Room, RoomEntity, RoomRequest } from './room.model'
import { RoomRepository } from './room.repository'
import { generateId } from '../../common'
import { LightService } from '../../light'
import { inject, injectable } from 'tsyringe'
import { LightGroupService } from '../../common/domain/lightGroup/lightGroup.service'

@injectable()
export class RoomService extends LightGroupService<Room, RoomEntity> {
  constructor (
        @inject(LightService) lightService: LightService,
        @inject(RoomRepository) repository: RoomRepository
  ) {
    super(lightService, repository)
  }

  create (room: Partial<RoomRequest> = {}): Promise<Room> {
    const newRoom: RoomEntity = {
      id: generateId(),
      color: room.color ?? '#708090',
      lights: room.lights ?? [],
      icon: room.icon ?? 'self_improvement',
      name: room.name ?? 'NO NAME'
    }
    return super.create(newRoom)
  }

  toggleLightsByRoomId (id: string): Promise<Room> {
    return super.toggleLightGroupById(id)
  }
}
