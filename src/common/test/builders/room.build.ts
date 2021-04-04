import { Room, RoomEntity } from '../../../room'
import { buildLight } from './light.build'
import { generateId } from '../../domain'

export function buildRoomEntity (room: Partial<RoomEntity> = {}): RoomEntity {
  return {
    color: room.color ?? 'dodgerblue',
    lights: room.lights ?? ['irrelevantDevice1', 'irrelevantDevice2'],
    icon: room.icon ?? 'bedtime',
    id: room.id ?? 'irrelevantRoomId',
    name: room.name ?? 'Bedroom'
  }
}

export function buildRoom (room: Partial<Room> = {}): Room {
  return {
    color: room.color ?? 'dodgerblue',
    lights: room.lights ?? [buildLight({ id: 'irrelevantDevice1' }), buildLight({ id: 'irrelevantDevice2' })],
    icon: room.icon ?? 'bedtime',
    id: room.id ?? generateId(),
    name: room.name ?? 'Bedroom'
  }
}
