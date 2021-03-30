import { LifxRepository } from '../repositories'
import { Device, ProviderService } from '../../../domain'

export class LifxService implements ProviderService {
  readonly devices = new Map<string, Device>()
  readonly expirationTime = 1000 * 60
  readonly lastUpdateTime = Date.now()

  constructor (private readonly lifxRepository: LifxRepository) {
  }

  async init (): Promise<void> {
    await this.getAllLights()
  }

  async fetchDevices (): Promise<Device[]> {
    await this.getAllLights()
    return this.getDevices()
  }

  getDevices (): Device[] {
    return [...this.devices.values()]
  }

  getDeviceByName (name: string): Device {
    const device = this.devices.get(name)
    if (device === undefined) {
      throw new Error(`Device ${name} not found in: ${[...this.devices.keys()].join()}`)
    } else {
      return device
    }
  }

  async toggleDeviceByName (alias: string): Promise<Device[]> {
    const device = await this.getDeviceByName(alias)
    return await this.toggleDevice(device)
  }

  async toggleDeviceById (deviceId: string): Promise<Device[]> {
    const device = [...this.devices.values()].find(({ id }) => id === deviceId)
    return await this.toggleDevice(device)
  }

  async setLightState (device: Device): Promise<Device[]> {
    const cachedDevice = await this.getDeviceByName(device.name)
    await this.lifxRepository.setState(`id:${device.id}`, {
      power: device.power ? 'on' : 'off',
      color: `kelvin:${device.colorTemp ?? cachedDevice.colorTemp}`,
      brightness: (device.brightness ?? cachedDevice.brightness) / 100
    })
    this.devices.set(device.name, device)
    return this.getDevices()
  }

  private async toggleDevice (device: Device | undefined): Promise<Device[]> {
    if (device !== undefined) {
      return await this.setLightState({ ...device, power: !device.power })
    }
    return this.getDevices()
  }

  private async getAllLights (): Promise<void> {
    const firstUpdate = this.devices.size === 0
    const lights: Device[] = await this.lifxRepository.getAllLights()

    for (const light of lights) {
      this.devices.set(light.name, light)
      console.debug(`${firstUpdate ? 'Found' : 'Updated'} light ${light.name}`)
    }
  }
}
