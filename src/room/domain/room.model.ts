import { Light } from '../../light'

export interface Room {
    id: string
    name: string
    color: string
    icon: string
    lights: Light[]
}

export type RoomEntity = Omit<Room, 'lights'> & {
    lights: string[]
}

export type RoomRequest = Omit<RoomEntity, 'id'>
