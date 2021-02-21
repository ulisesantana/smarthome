import { TplinkService } from './tplink.service'
import { Device, LightConfig } from '../domain'

export class BedroomService {
  readonly warmLight = 2700
  readonly whiteLight = 6500
  private lastSelectedLightsConfig: LightConfig = {
    colorTemp: this.warmLight,
    brightness: 0
  }

  readonly deviceNames = [
    'Puerta Terraza',
    'Esquina Dormitorio',
    'Puerta Dormitorio'
  ]

  constructor (private readonly tplinkService: TplinkService) {
  }

  getLights (): Device[] {
    return this.deviceNames
      .map((name) => this.tplinkService.getDeviceByName(name))
      .filter(Boolean)
  }

  async toggleScene (lightConfig: LightConfig, namesOfDevicesToUpdate = this.deviceNames): Promise<Device[]> {
    const devices = this.getLights()
    let { devicesToUpdate, devicesToPowerOff } = this.filterDevicesToUpdate(devices, namesOfDevicesToUpdate)
    const isBedroomOn = await this.isBedroomOn()

    if (isBedroomOn && this.isLightConfigAlreadyInUse(lightConfig)) {
      devicesToPowerOff = devices
    } else {
      for await (const device of this.updateDevices(devicesToUpdate, { ...lightConfig, power: true })) {
        console.debug(`Device ${device.name} updated.`)
      }
    }

    for await (const device of this.updateDevices(devicesToPowerOff, { power: false })) {
      console.debug(`Device ${device.name} powered off.`)
    }

    this.lastSelectedLightsConfig = lightConfig

    return this.getLights()
  }

  private async isBedroomOn (): Promise<boolean> {
    const bulbs = this.getLights()
    return bulbs.some(bulb => bulb.power)
  }

  private async * updateDevices (devices: Device[], config: Partial<Device>): AsyncGenerator<Device> {
    for (const device of devices) {
      const updatedDevice = { ...device, ...config }
      await this.tplinkService.setLightState(updatedDevice)
      yield updatedDevice
    }
  }

  private filterDevicesToUpdate (devices: Device[], namesOfDevicesToUpdate: string[]): { devicesToUpdate: Device[], devicesToPowerOff: Device[] } {
    return devices.reduce(
      ({ devicesToUpdate, devicesToPowerOff }, device) => namesOfDevicesToUpdate.includes(device.name)
        ? { devicesToUpdate: [...devicesToUpdate, device], devicesToPowerOff }
        : { devicesToUpdate, devicesToPowerOff: [...devicesToPowerOff, device] }
      , { devicesToUpdate: [] as Device[], devicesToPowerOff: [] as Device[] }
    )
  }

  private isLightConfigAlreadyInUse (lightsConfig: LightConfig): boolean {
    return JSON.stringify(lightsConfig) === JSON.stringify(this.lastSelectedLightsConfig)
  }
}
