import { Scene, SceneResponse } from '../../../src/scene'
import { expectLightsArrayToBeEqual } from './expectLightsArrayToBeEqual'

export function expectScenesToBeEqual (scene: SceneResponse, expectedScene: Scene) {
  const { lights, ...sceneResponse } = scene
  const { lights: expectedLights, ...expectedSceneWithoutLights } = expectedScene
  expect(sceneResponse).toStrictEqual(expectedSceneWithoutLights)
  expectLightsArrayToBeEqual(lights, expectedLights.getAll())
}
