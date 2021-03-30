import { MongoDB, Provider } from '../../common'
import { Device, DeviceType } from './device.model'
import { DeviceError } from './device.error'

type DeviceEntity = Partial<Device>

export class DeviceRepository {
    static readonly collection = 'devices'

    constructor (
        private mongodb = new MongoDB(DeviceRepository.collection)
    ) { }

    async findAll (): Promise<Device[]> {
      try {
        const response = await this.mongodb.find<DeviceEntity>({})
        return response.map(DeviceRepository.mapToDomain)
      } catch (error) {
        throw new DeviceError(error)
      }
    }

    async findById (id: string): Promise<Device> {
      try {
        const response = await this.mongodb.findOne<DeviceEntity>({ id })
        return DeviceRepository.mapToDomain(response)
      } catch (error) {
        throw new DeviceError(error)
      }
    }

    async findAllByProvider (provider: Provider): Promise<Device[]> {
      try {
        const response = await this.mongodb.find<DeviceEntity>({ provider })
        return response.map(DeviceRepository.mapToDomain)
      } catch (error) {
        throw new DeviceError(error)
      }
    }

    async upsert (device: Device): Promise<Device> {
      try {
        const response = await this.mongodb.upsertOne<DeviceEntity>({ id: device.id }, DeviceRepository.mapToDatabase(device))
        return DeviceRepository.mapToDomain(response)
      } catch (error) {
        throw new DeviceError(error)
      }
    }

    private static mapToDatabase (deviceEntity: DeviceEntity = {}): DeviceEntity {
      return {
        brightness: deviceEntity.brightness ?? 0,
        colorTemp: deviceEntity.colorTemp ?? 0,
        id: deviceEntity.id ?? '',
        name: deviceEntity.name ?? '',
        power: deviceEntity.power ?? false,
        available: deviceEntity.available ?? false,
        provider: deviceEntity.provider ?? Provider.Unknown,
        type: deviceEntity.type ?? DeviceType.Plug
      }
    }

    private static mapToDomain (deviceEntity: DeviceEntity = {}): Device {
      return {
        brightness: deviceEntity.brightness ?? 0,
        colorTemp: deviceEntity.colorTemp ?? 0,
        id: deviceEntity.id ?? '',
        name: deviceEntity.name ?? '',
        power: deviceEntity.power ?? false,
        available: deviceEntity.available ?? false,
        provider: deviceEntity.provider ?? Provider.Unknown,
        type: deviceEntity.type ?? DeviceType.Bulb
      }
    }
}
