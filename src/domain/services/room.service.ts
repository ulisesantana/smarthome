import { Device, LightConfig } from '../index'
import { DeviceService } from './device.service'

export class RoomService {
  constructor (private readonly deviceService: DeviceService, readonly deviceList: string[]) {
  }

  getLights (): Device[] {
    return this.deviceService.getDevices(this.deviceList)
  }

  async toggleScene (lightConfig: LightConfig, namesOfDevicesToUpdate = this.deviceList): Promise<Device[]> {
    const devices = this.getLights()
    let { devicesToUpdate, devicesToPowerOff } = this.deviceService.filterDevicesToUpdate(devices, namesOfDevicesToUpdate)
    const isRoomOn = this.getLights().some(({ power }) => power)

    if (isRoomOn && this.deviceService.isLightConfigAlreadyInUse(lightConfig)) {
      devicesToPowerOff = devices
    } else {
      for await (const device of this.deviceService.updateDevices(devicesToUpdate, { ...lightConfig, power: true })) {
        console.debug(`Device ${device.name} updated.`)
      }
    }

    for await (const device of this.deviceService.updateDevices(devicesToPowerOff, { power: false })) {
      console.debug(`Device ${device.name} powered off.`)
    }

    this.deviceService.lastSelectedLightsConfig = lightConfig

    return this.getLights()
  }
}
