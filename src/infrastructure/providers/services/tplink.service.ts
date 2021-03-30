import { Device, ProviderService } from '../../../domain'
import { TplinkRepository } from '../repositories'

export class TplinkService implements ProviderService {
  private readonly devices = new Map<string, Device>()

  constructor (private readonly tplinkRepository: TplinkRepository) {
  }

  async init (): Promise<void> {
    const devices = await this.tplinkRepository.getAllDevices()
    for (const device of devices) {
      this.devices.set(device.name, device)
    }
  }

  async fetchDevices (): Promise<Device[]> {
    await this.init()
    return this.getDevices()
  }

  getDevices (): Device[] {
    return [...this.devices.values()]
  }

  getDeviceByName (alias: string): Device {
    const device = this.devices.get(alias)
    if (device === undefined) {
      throw new Error(`Device ${alias} not found in: ${[...this.devices.keys()].join()}`)
    }
    return device
  }

  async toggleDeviceByName (alias: string): Promise<Device[]> {
    const device = this.devices.get(alias)
    return await this.toggleDevice(device)
  }

  async toggleDeviceById (deviceId: string): Promise<Device[]> {
    const device = [...this.devices.values()].find(({ id }) => id === deviceId)
    return await this.toggleDevice(device)
  }

  async setLightState (device: Device): Promise<Device[]> {
    const updatedDevice = await this.tplinkRepository.setState(device)
    this.devices.set(updatedDevice.name, updatedDevice)
    return this.getDevices()
  }

  private async toggleDevice (device: Device | undefined): Promise<Device[]> {
    if (device !== undefined) {
      return await this.setLightState({ ...device, power: !device.power })
    }
    return this.getDevices()
  }
}
