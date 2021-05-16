import { expectLightsArrayToBeEqual } from './expectLightsArrayToBeEqual'
import { Room, RoomResponse } from '../../../src/room'

export function expectRoomsToBeEqual (scene: RoomResponse, expectedScene: Room) {
  const { lights, ...sceneResponse } = scene
  const { lights: expectedLights, ...expectedSceneWithoutLights } = expectedScene
  expect(sceneResponse).toStrictEqual(expectedSceneWithoutLights)
  expectLightsArrayToBeEqual(lights, expectedLights.getAll())
}
