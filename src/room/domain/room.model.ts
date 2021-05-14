import { LightGroup } from '../../lightGroup/domain/lightGroup.model'

export type Room = LightGroup

export type RoomEntity = Omit<Room, 'lights'> & {
    lights: string[]
}

export type RoomRequest = Omit<RoomEntity, 'id'>
