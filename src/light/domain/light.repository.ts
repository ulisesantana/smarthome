import { MongoDB, MongoAPI } from '../../common'
import { Light, LightType } from './light.model'
import { LightError } from './light.error'
import { Provider } from '../../provider'
import { inject, injectable } from 'tsyringe'

type LightEntity = Partial<Light>

@injectable()
export class LightRepository {
    static readonly collection = 'lights'
    private readonly mongodb: MongoAPI

    constructor (@inject(MongoDB) instance: MongoDB) {
      this.mongodb = instance.useCollection(LightRepository.collection)
    }

    async findAll (): Promise<Light[]> {
      try {
        const response = await this.mongodb.find<LightEntity>({})
        return response.map(LightRepository.mapToDomain)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async findAllById (ids: string[]): Promise<Light[]> {
      try {
        const response = await this.mongodb.find<LightEntity>({ id: { $in: ids } })
        return response.map(LightRepository.mapToDomain)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async findById (id: string): Promise<Light> {
      try {
        const response = await this.mongodb.findOne<LightEntity>({ id })
        return LightRepository.mapToDomain(response)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async findAllByProvider (provider: Provider): Promise<Light[]> {
      try {
        const response = await this.mongodb.find<LightEntity>({ provider })
        return response.map(LightRepository.mapToDomain)
      } catch (error) {
        throw new LightError(error)
      }
    }

    async upsert (device: Light): Promise<Light> {
      try {
        const response = await this.mongodb.upsertOne<LightEntity>({ id: device.id }, LightRepository.mapToDatabase(device))
        return LightRepository.mapToDomain(response)
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
        provider: deviceEntity.provider ?? Provider.Unknown,
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
        provider: deviceEntity.provider ?? Provider.Unknown,
        type: deviceEntity.type ?? LightType.Bulb
      }
    }
}
