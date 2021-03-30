import { Device } from '../domain'

export enum Provider {
    TpLink = 'tplink',
    Lifx = 'lifx',
    Unknown = 'unknown'
}

export interface ProviderRepository {
    getAllDevices: () => Promise<Device[]>
    setState: (device: Device) => Promise<void>
}

export abstract class ProviderService {
  protected constructor (private readonly repository: ProviderRepository) {}

  async init (dbDevices: Device[]): Promise<Device[]> {
    const providerDevices = await this.repository.getAllDevices()
    const providerDevicesIds = providerDevices.map(({ id }) => id)
    const providerMissingDevices = dbDevices.filter(({ id }) => !providerDevicesIds.includes(id))

    return [
      ...providerDevices,
      ...providerMissingDevices
    ]
  }

  async setLightState (device: Device): Promise<void> {
    await this.repository.setState(device)
  }
}
