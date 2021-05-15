import { MongoDB, MongoAPI } from '../../common'
import { Light, LightType } from '../domain/light.model'
import { LightError } from '../domain/light.error'
import { Brand } from '../../brand'
import { inject, injectable } from 'tsyringe'
import { LightRepository } from '../domain/light.repository'

type LightEntity = Partial<Light>

@injectable()
export class LightMongoRepository implements LightRepository {
    static readonly collection = 'lights'
    private readonly mongodb: MongoAPI

    constructor (@inject(MongoDB) instance: MongoDB) {
      this.mongodb = instance.useCollection(LightMongoRepository.collection)
    }

    async getAll (): Promise<Light[]> {
      try {
        const response = await this.mongodb.find<LightEntity>({})
        return response.map(LightMongoRepository.mapToDomain)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async getAllById (ids: string[]): Promise<Light[]> {
      try {
        const response = await this.mongodb.find<LightEntity>({ id: { $in: ids } })
        return response.map(LightMongoRepository.mapToDomain)
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

    async update (device: Light): Promise<Light> {
      try {
        const response = await this.mongodb.upsertOne<LightEntity>({ id: device.id }, LightMongoRepository.mapToDatabase(device))
        return LightMongoRepository.mapToDomain(response)
      } catch (error) {
        throw new LightError(error)
      }
    }

    private static mapToDatabase (deviceEntity: LightEntity = {}): LightEntity {
      return {
        brightness: deviceEntity.brightness ?? 0,
        colorTemp: deviceEntity.colorTemp ?? 0,
        id: deviceEntity.id ?? '',
        name: deviceEntity.name ?? '',
        power: deviceEntity.power ?? false,
        available: deviceEntity.available ?? false,
        brand: deviceEntity.brand ?? Brand.Unknown,
        type: deviceEntity.type ?? LightType.Plug
      }
    }

    private static mapToDomain (deviceEntity: LightEntity = {}): Light {
      return {
        brightness: deviceEntity.brightness ?? 0,
        colorTemp: deviceEntity.colorTemp ?? 0,
        id: deviceEntity.id ?? '',
        name: deviceEntity.name ?? '',
        power: deviceEntity.power ?? false,
        available: deviceEntity.available ?? false,
        brand: deviceEntity.brand ?? Brand.Unknown,
        type: deviceEntity.type ?? LightType.Bulb
      }
    }
}
