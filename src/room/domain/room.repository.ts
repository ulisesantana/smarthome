import { MongoDB } from '../../common'
import { Room, RoomEntity } from './room.model'
import { RoomError } from './room.error'
import { inject, injectable } from 'tsyringe'
import { LightGroupRepository } from '../../common/domain/lightGroup/lightGroup.repository'

@injectable()
export class RoomRepository extends LightGroupRepository<Room, RoomEntity> {
    static readonly collection = 'rooms'

    constructor (@inject(MongoDB) instance: MongoDB) {
      super(instance.useCollection(RoomRepository.collection), RoomError)
    }
}
