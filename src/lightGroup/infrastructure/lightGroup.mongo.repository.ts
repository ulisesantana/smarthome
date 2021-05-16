import { MongoAPI } from '../../common'
import { LightGroup, LightGroupEntity, RawLightGroup } from '../domain/lightGroup.model'
import { FilterQuery } from 'mongodb'
import { LightGroupRepository } from '../domain/lightGroup.repository'
import { Light, Lights } from '../../light'

type Constructor<T> = new(...args: any[]) => T

export abstract class LightGroupMongoRepository<Model extends LightGroup, Entity extends LightGroupEntity> implements LightGroupRepository<Model, Entity> {
  protected constructor (
      private readonly mongodb: MongoAPI,
      private readonly ModelError: Constructor<Error>
  ) {}

  async getAll (): Promise<Model[]> {
    try {
      const models = await this.mongodb.aggregate<RawLightGroup>([{
        $lookup: {
          from: 'lights',
          localField: 'lights',
          foreignField: 'id',
          as: 'lights'
        }
      }])
      return models.map(model => ({
        ...model,
        lights: new Lights(model?.lights?.map(light => new Light(light)))
      }) as Model)
    } catch (error) {
      throw new this.ModelError(error)
    }
  }

  async getById (id: string): Promise<Model> {
    try {
      const [model] = await this.mongodb.aggregate<RawLightGroup>([
        { $match: { id } },
        {
          $lookup: {
            from: 'lights',
            localField: 'lights',
            foreignField: 'id',
            as: 'lights'
          }
        }])
      return {
        ...model,
        lights: new Lights(model?.lights?.map(light => new Light(light)))
      } as Model
    } catch (error) {
      throw new this.ModelError(error)
    }
  }

  async create (entity: Entity): Promise<void> {
    try {
      await this.mongodb.upsertOne<Entity>({ id: entity.id } as FilterQuery<Entity>, entity)
    } catch (error) {
      throw new this.ModelError(error)
    }
  }

  async update (entity: Partial<Entity>): Promise<Entity> {
    try {
      return this.mongodb.upsertOne<Entity>({ id: entity.id } as FilterQuery<Entity>, entity)
    } catch (error) {
      throw new this.ModelError(error)
    }
  }

  async remove (id: string): Promise<void> {
    try {
      await this.mongodb.remove<Entity>({ id } as FilterQuery<Entity>)
    } catch (error) {
      throw new this.ModelError(error)
    }
  }
}
