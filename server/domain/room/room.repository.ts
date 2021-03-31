import { MongoDB } from '../../common'
import { Room, RoomEntity } from './room.model'
import { RoomError } from './room.error'

export class RoomRepository {
    static readonly collection = 'rooms'

    constructor (
        private mongodb = new MongoDB(RoomRepository.collection)
    ) { }

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

    private static mapToDatabase ({ devices, ...roomWithoutDevices }: Partial<Room>): Partial<RoomEntity> {
      if (devices) {
        return {
          ...roomWithoutDevices,
          devices: devices.map(({ id }) => id)
        }
      }
      return roomWithoutDevices
    }
}
