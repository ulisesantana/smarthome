import { Scene, SceneEntity, SceneRequest } from './scene.model'
import { SceneRepository } from '../infrastructure/scene.repository'
import { generateId } from '../../common'
import { Light, Lights, LightService } from '../../light'
import { inject, injectable } from 'tsyringe'
import { LightGroupService } from '../../lightGroup/domain/lightGroup.service'
import { LightGroupRepository } from '../../lightGroup/domain/lightGroup.repository'

@injectable()
export class SceneService extends LightGroupService<Scene, SceneEntity> {
  constructor (
        @inject(LightService) lightService: LightService,
        @inject(SceneRepository) repository: LightGroupRepository<Scene, SceneEntity>
  ) {
    super(lightService, repository)
  }

  create (scene: Partial<SceneRequest> = {}): Promise<Scene> {
    const newScene: SceneEntity = {
      id: generateId(),
      color: scene.color ?? 'orangered',
      lights: scene.lights ?? [],
      icon: scene.icon ?? 'wb_sunny',
      name: scene.name ?? 'NO NAME',
      brightness: scene.brightness ?? 50,
      colorTemp: scene.colorTemp ?? 3200
    }
    return super.create(newScene)
  }

  async toggleLightsBySceneId (id: string): Promise<Scene> {
    const scene = await this.getById(id)
    const updatedLights = []
    if (scene?.id !== undefined) {
      for await (const light of this.toggleSceneLights(scene)) {
        updatedLights.push(light)
      }
      scene.lights = new Lights(updatedLights)
    }
    return scene
  }

  private async * toggleSceneLights (scene: Scene): AsyncGenerator<Light> {
    const newPowerState = !scene.lights.anyLightIsPoweredUp()
    const config = {
      brightness: scene.brightness,
      colorTemp: scene.colorTemp,
      power: newPowerState
    }
    for (const light of scene.lights.getAll()) {
      await this.lightService.setLightStateById(light.id, config)
      yield light.updateState(config as Partial<Light>)
    }
  }
}
