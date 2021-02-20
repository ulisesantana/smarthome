import { LifxRepository } from '../repositories'
import { Device, DeviceService } from '../domain'

export class LifxService implements DeviceService {
  readonly devices = new Map<string, Device>()
  readonly expirationTime = 1000 * 60
  readonly lastUpdateTime = Date.now()

  constructor (private readonly lifxRepository = new LifxRepository(process.env.LIFX_TOKEN ?? '')) {
  }

  async init (): Promise<void> {
    await this.updateDevices()
  }

  async getDevices (): Promise<Device[]> {
    await this.updateDevicesIfCacheIsExpired()
    return [...this.devices.values()]
  }

  async getDeviceByName (alias: string): Promise<Device> {
    await this.updateDevicesIfCacheIsExpired()
    const device = this.devices.get(alias)
    if (device === undefined) {
      throw new Error(`Device ${alias} not found in: ${[...this.devices.keys()].join()}`)
    }
    return device
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
    return await this.getDevices()
  }

  private async toggleDevice (device: Device | undefined): Promise<Device[]> {
    if (device !== undefined) {
      return await this.setLightState({ ...device, power: !device.power })
    }
    return await this.getDevices()
  }

  private async updateDevices (): Promise<void> {
    const firstUpdate = this.devices.size === 0
    const lights: Device[] = await this.lifxRepository.getAllLights()

    for (const light of lights) {
      this.devices.set(light.name, light)
      if (firstUpdate) {
        console.debug(`Found light ${light.name}`)
      } else {
        console.debug(`Updated light ${light.name}`)
      }
    }
  }

  isCacheExpired (): boolean {
    return (this.lastUpdateTime + this.expirationTime) < Date.now()
  }

  async updateDevicesIfCacheIsExpired (): Promise<void> {
    if (this.isCacheExpired()) {
      await this.updateDevices()
    }
  }
}
