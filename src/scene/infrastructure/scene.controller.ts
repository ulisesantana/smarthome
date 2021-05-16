import { Scene, SceneEntity, SceneRequest, SceneService } from '..'
import { inject, injectable } from 'tsyringe'
import { Light } from '../../light'

export interface SceneResponse {
  id: string
  name: string
  color: string
  icon: string
  lights: Light[]
  brightness: number
  colorTemp: number
}

@injectable()
export class SceneController {
  constructor (@inject(SceneService) private readonly service: SceneService) {}

  async getSceneById (id: string): Promise<SceneResponse> {
    return SceneController.mapToJSON(await this.service.getById(id))
  }

  async getScenes (): Promise<SceneResponse[]> {
    const scenes = await this.service.getAll()
    return scenes.map(SceneController.mapToJSON)
  }

  async createScene (room: Partial<SceneEntity>): Promise<SceneResponse> {
    return SceneController.mapToJSON(await this.service.create(room))
  }

  async updateScene (id: string, room: Partial<SceneRequest>): Promise<SceneResponse> {
    return SceneController.mapToJSON(await this.service.update(id, room))
  }

  removeScene (id: string): Promise<boolean> {
    return this.service.remove(id)
  }

  async toggleSceneById (id: string): Promise<SceneResponse> {
    return SceneController.mapToJSON(await this.service.toggleLightsBySceneId(id))
  }

  private static mapToJSON (scene: Scene): SceneResponse {
    return {
      brightness: scene?.brightness,
      color: scene?.color,
      colorTemp: scene?.colorTemp,
      icon: scene?.icon,
      id: scene?.id,
      lights: scene?.lights?.getAll(),
      name: scene?.name
    }
  }
}
