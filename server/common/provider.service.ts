import { Device, DeviceRepository } from '../domain'

export enum Provider {
    TpLink = 'tplink',
    Lifx = 'lifx',
    Unknown = 'unknown'
}

export interface ProviderRepository {
    getAllDevices: () => Promise<Device[]>
    setState: (device: Device) => Promise<Device>
}

export interface ProviderServiceConstructorParams {
    providerRepository: ProviderRepository
    deviceRepository: DeviceRepository
    provider: Provider
}

export abstract class ProviderService {
    private readonly repository: ProviderRepository
    private readonly deviceRepository: DeviceRepository
    private readonly provider: Provider

    protected constructor ({ providerRepository, deviceRepository, provider }: ProviderServiceConstructorParams) {
      this.repository = providerRepository
      this.deviceRepository = deviceRepository
      this.provider = provider
    }

    async init (): Promise<void> {
      const [dbDevices, providerDevices] = await Promise.all([
        this.deviceRepository.findAllByProvider(this.provider),
        this.repository.getAllDevices()
      ])

      for (const device of providerDevices) {
        await this.deviceRepository.upsert(device)
        console.debug(`Found light ${device.name}`)
      }

      const providerDevicesIds = providerDevices.map(({ id }) => id)
      for (const device of dbDevices) {
        if (!providerDevicesIds.includes(device.id)) {
          await this.deviceRepository.upsert({ ...device, available: false })
          console.debug(`Light ${device.name} not found.`)
        }
      }
    }

    async setLightState (device: Device): Promise<void> {
      const updatedDevice = await this.repository.setState(device)
      await this.deviceRepository.upsert(updatedDevice)
    }

    async toggleDevice (device: Device | undefined): Promise<void> {
      if (device !== undefined) {
        await this.setLightState({ ...device, power: !device.power })
      }
    }
}
