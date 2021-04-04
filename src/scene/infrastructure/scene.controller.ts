import { Scene, SceneEntity, SceneRequest, SceneService } from '..'
import { inject, injectable } from 'tsyringe'

@injectable()
export class SceneController {
  constructor (@inject(SceneService) private readonly service: SceneService) {}

  getSceneById (id: string): Promise<Scene> {
    return this.service.getById(id)
  }

  getScenes (): Promise<Scene[]> {
    return this.service.getAll()
  }

  createScene (room: Partial<SceneEntity>): Promise<Scene> {
    return this.service.create(room)
  }

  updateScene (id: string, room: Partial<SceneRequest>): Promise<Scene> {
    return this.service.update(id, room)
  }

  removeScene (id: string): Promise<boolean> {
    return this.service.remove(id)
  }

  toggleSceneById (id: string): Promise<Scene> {
    return this.service.toggleLightsBySceneId(id)
  }
}
