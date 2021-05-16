import { Room, RoomEntity } from '../../../room'
import { buildLight } from './light.build'
import { generateId } from '../../domain'
import { Lights } from '../../../light'

export function buildRoomEntity (room: Partial<RoomEntity> = {}): RoomEntity {
  return {
    color: room.color ?? 'dodgerblue',
    lights: room.lights ?? [generateId(), generateId()],
    icon: room.icon ?? 'bedtime',
    id: room.id ?? 'irrelevantRoomId',
    name: room.name ?? 'Bedroom'
  }
}

export function buildRoom (room: Partial<Room> = {}): Room {
  return {
    color: room.color ?? 'dodgerblue',
    lights: room.lights ?? new Lights([buildLight(), buildLight()]),
    icon: room.icon ?? 'bedtime',
    id: room.id ?? generateId(),
    name: room.name ?? 'Bedroom'
  }
}
