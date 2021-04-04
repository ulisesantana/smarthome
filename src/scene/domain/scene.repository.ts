import { MongoDB } from '../../common'
import { Scene, SceneEntity } from './scene.model'
import { SceneError } from './scene.error'
import { inject, injectable } from 'tsyringe'
import { LightGroupRepository } from '../../common/domain/lightGroup/lightGroup.repository'

@injectable()
export class SceneRepository extends LightGroupRepository<Scene, SceneEntity> {
    static readonly collection = 'scenes'

    constructor (@inject(MongoDB) instance: MongoDB) {
      super(instance.useCollection(SceneRepository.collection), SceneError)
    }
}
