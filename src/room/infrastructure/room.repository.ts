import { MongoDB } from '../../common'
import { Room, RoomEntity } from '../domain/room.model'
import { RoomError } from '../domain/room.error'
import { inject, injectable } from 'tsyringe'
import { LightGroupMongoRepository } from '../../lightGroup/infrastructure/lightGroup.mongo.repository'

@injectable()
export class RoomRepository extends LightGroupMongoRepository<Room, RoomEntity> {
    static readonly collection = 'rooms'

    constructor (@inject(MongoDB) instance: MongoDB) {
      super(instance.useCollection(RoomRepository.collection), RoomError)
    }
}
