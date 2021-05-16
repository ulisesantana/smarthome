import { Scene, SceneEntity } from '../../../scene'
import { buildLight } from './light.build'
import { generateId } from '../../domain'
import { Lights } from '../../../light'

export function buildSceneEntity (scene: Partial<SceneEntity> = {}): SceneEntity {
  return {
    color: scene.color ?? 'orangered',
    lights: scene.lights ?? ['irrelevantDevice1', 'irrelevantDevice2'],
    icon: scene.icon ?? 'wb_sunny',
    id: scene.id ?? generateId(),
    name: scene.name ?? 'Day',
    brightness: 25,
    colorTemp: 2700
  }
}

export function buildScene (scene: Partial<Scene> = {}): Scene {
  return {
    color: scene.color ?? 'orangered',
    lights: scene.lights ?? new Lights([
      buildLight(),
      buildLight()
    ]),
    icon: scene.icon ?? 'wb_sunny',
    id: scene.id ?? generateId(),
    name: scene.name ?? 'Day',
    brightness: 25,
    colorTemp: 2700
  }
}
