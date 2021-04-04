import { MongoAPI } from '../../index'
import { LightGroup, LightGroupEntity } from './lightGroup.model'
import { FilterQuery } from 'mongodb'

type Constructor<T> = new(...args: any[]) => T

export abstract class LightGroupRepository<Model extends LightGroup, Entity extends LightGroupEntity> {
  protected constructor (
      private readonly mongodb: MongoAPI,
      private readonly ModelError: Constructor<Error>
  ) {}

  async findAll (): Promise<Model[]> {
    try {
      return await this.mongodb.aggregate<Model>([{
        $lookup: {
          from: 'lights',
          localField: 'lights',
          foreignField: 'id',
          as: 'lights'
        }
      }])
    } catch (error) {
      throw new this.ModelError(error)
    }
  }

  async findById (id: string): Promise<Model> {
    try {
      const [model] = await this.mongodb.aggregate<Model>([
        { $match: { id } },
        {
          $lookup: {
            from: 'lights',
            localField: 'lights',
            foreignField: 'id',
            as: 'lights'
          }
        }])
      return model
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
