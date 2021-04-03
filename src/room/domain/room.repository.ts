import { MongoDB, MongoAPI } from '../../common'
import { Room, RoomEntity } from './room.model'
import { RoomError } from './room.error'
import { inject, injectable } from 'tsyringe'

@injectable()
export class RoomRepository {
    static readonly collection = 'rooms'
    private readonly mongodb: MongoAPI

    constructor (@inject(MongoDB) instance: MongoDB) {
      this.mongodb = instance.useCollection(RoomRepository.collection)
    }

    async findAll (): Promise<Room[]> {
      try {
        return await this.mongodb.aggregate<Room[]>([{
          $lookup: {
            from: 'devices',
            localField: 'devices',
            foreignField: 'id',
            as: 'devices'
          }
        }])
      } catch (error) {
        throw new RoomError(error)
      }
    }

    async findById (id: string): Promise<Room> {
      try {
        return await this.mongodb.aggregate<Room>([
          { $match: { id } },
          {
            $lookup: {
              from: 'devices',
              localField: 'devices',
              foreignField: 'id',
              as: 'devices'
            }
          }])
      } catch (error) {
        throw new RoomError(error)
      }
    }

    async create (room: RoomEntity): Promise<void> {
      try {
        await this.mongodb.upsertOne<RoomEntity>({ id: room.id }, room)
      } catch (error) {
        throw new RoomError(error)
      }
    }

    async update (room: Partial<Room>): Promise<void> {
      try {
        await this.mongodb.upsertOne<RoomEntity>({ id: room.id }, RoomRepository.mapToDatabase(room))
      } catch (error) {
        throw new RoomError(error)
      }
    }

    async remove (id: string): Promise<void> {
      try {
        await this.mongodb.remove<RoomEntity>({ id })
      } catch (error) {
        throw new RoomError(error)
      }
    }

    private static mapToDatabase ({ lights, ...roomWithoutDevices }: Partial<Room>): Partial<RoomEntity> {
      if (lights) {
        return {
          ...roomWithoutDevices,
          lights: lights.map(({ id }) => id)
        }
      }
      return roomWithoutDevices
    }
}
