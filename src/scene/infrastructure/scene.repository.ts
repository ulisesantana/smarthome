import { MongoDB } from '../../common'
import { Scene, SceneEntity } from '../domain/scene.model'
import { SceneError } from '../domain/scene.error'
import { inject, injectable } from 'tsyringe'
import { LightGroupMongoRepository } from '../../lightGroup/infrastructure/lightGroup.mongo.repository'

@injectable()
export class SceneRepository extends LightGroupMongoRepository<Scene, SceneEntity> {
    static readonly collection = 'scenes'

    constructor (@inject(MongoDB) instance: MongoDB) {
      super(instance.useCollection(SceneRepository.collection), SceneError)
    }
}
