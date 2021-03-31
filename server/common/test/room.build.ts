import { Room, RoomEntity } from '../../domain'
import { buildDevice } from './device.build'

export function buildRoomEntity (room: Partial<RoomEntity> = {}): RoomEntity {
  return {
    color: room.color ?? 'dodgerblue',
    devices: room.devices ?? ['irrelevantDevice1', 'irrelevantDevice2'],
    icon: room.icon ?? 'bedtime',
    id: room.id ?? 'irrelevantRoomId',
    name: room.name ?? 'Bedroom'
  }
}

export function buildRoom (room: Partial<Room> = {}): Room {
  return {
    color: room.color ?? 'dodgerblue',
    devices: room.devices ?? [buildDevice({ id: 'irrelevantDevice1' }), buildDevice({ id: 'irrelevantDevice2' })],
    icon: room.icon ?? 'bedtime',
    id: room.id ?? 'irrelevantRoomId',
    name: room.name ?? 'Bedroom'
  }
}
