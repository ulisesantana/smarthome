import { MongoDB, MongoAPI } from '../../common'
import { Light, LightType } from '../domain/light.model'
import { LightError } from '../domain/light.error'
import { Brand } from '../../brand'
import { inject, injectable } from 'tsyringe'
import { LightRepository } from '../domain/light.repository'
import { Lights } from '../domain/lights.model'

type LightEntity = Partial<Light>

@injectable()
export class LightMongoRepository implements LightRepository {
    static readonly collection = 'lights'
    private readonly mongodb: MongoAPI

    constructor (@inject(MongoDB) instance: MongoDB) {
      this.mongodb = instance.useCollection(LightMongoRepository.collection)
    }

    async getAll (): Promise<Lights> {
      try {
        const response = await this.mongodb.find<LightEntity>({})
        return new Lights(response.map(LightMongoRepository.mapToDomain))
      } catch (error) {
        throw new LightError(error)
      }
    }

    async getAllById (ids: string[]): Promise<Lights> {
      try {
        const response = await this.mongodb.find<LightEntity>({ id: { $in: ids } })
        return new Lights(response.map(LightMongoRepository.mapToDomain))
      } catch (error) {
        throw new LightError(error)
      }
    }

    async getById (id: string): Promise<Light> {
      try {
        const response = await this.mongodb.findOne<LightEntity>({ id })
        return LightMongoRepository.mapToDomain(response)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async update (light: Light): Promise<Light> {
      try {
        const lightToUpdate = LightMongoRepository.mapToDatabase(light)
        const response = await this.mongodb.upsertOne<LightEntity>({ id: lightToUpdate.id }, lightToUpdate)
        return LightMongoRepository.mapToDomain(response)
      } catch (error) {
        throw new LightError(error)
      }
    }

    private static mapToDatabase (light: Light): LightEntity {
      return {
        brightness: light.brightness ?? 0,
        colorTemp: light.colorTemp ?? 0,
        id: light.id ?? '',
        name: light.name ?? '',
        power: light.power ?? false,
        available: light.available ?? false,
        brand: light.brand ?? Brand.Unknown,
        type: light.type ?? LightType.Plug
      }
    }

    private static mapToDomain (deviceEntity: LightEntity = {}): Light {
      return new Light({
        brightness: deviceEntity.brightness,
        colorTemp: deviceEntity.colorTemp,
        id: deviceEntity.id ?? '',
        name: deviceEntity.name ?? '',
        power: deviceEntity.power,
        available: deviceEntity.available,
        brand: deviceEntity.brand ?? Brand.Unknown,
        type: deviceEntity.type
      })
    }
}
