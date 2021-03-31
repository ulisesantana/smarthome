import { Device } from '../device'

export interface Room {
    id: string
    name: string
    color: string
    icon: string
    devices: Device[]
}

export type RoomEntity = Omit<Room, 'devices'> & {
    devices: string[]
}
