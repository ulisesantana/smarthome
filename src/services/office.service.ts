import { Device, LightConfig } from '../domain'
import { TplinkService } from './tplink.service'
import { LifxService } from './lifx.service'

export class OfficeService {
  readonly warmLight = 2700
  readonly whiteLight = 6500
  readonly plug = 'Lampara estudio'
  readonly bulbs = [
    'Lámpara Izquierda',
    'Lámpara Derecha',
    'Entrada Escalera'
  ]

  private lastSelectedLightsConfig: LightConfig = {
    colorTemp: this.warmLight,
    brightness: 0
  }

  constructor (private readonly tplinkService: TplinkService, private readonly lifxService: LifxService) {}

  getLights (): Device[] {
    return [
      this.tplinkService.getDeviceByName(this.plug),
      this.bulbs.map(this.lifxService.getDeviceByName.bind(this.lifxService))
    ].flat()
  }

  async toggleScene (lightConfig: LightConfig, namesOfDevicesToUpdate = [...this.bulbs, this.plug]): Promise<Device[]> {
    const devices = this.getLights()
    let { devicesToUpdate, devicesToPowerOff } = this.filterDevicesToUpdate(devices, namesOfDevicesToUpdate)
    const isOfficeOn = await this.isOfficeOn()

    if (isOfficeOn && this.isLightConfigAlreadyInUse(lightConfig)) {
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

  private async isOfficeOn (): Promise<boolean> {
    const bulbs = this.getLights()
    return bulbs.some(bulb => bulb.power)
  }

  private async * updateDevices (devices: Device[], config: Partial<Device>): AsyncGenerator<Device> {
    for (const device of devices) {
      const updatedDevice = { ...device, ...config }
      device.name === this.plug
        ? await this.tplinkService.setLightState(updatedDevice)
        : await this.lifxService.setLightState(updatedDevice)
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
