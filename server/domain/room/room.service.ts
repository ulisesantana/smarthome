import { Device, DeviceService } from '../device'

export class RoomService {
  constructor (private readonly deviceService: DeviceService, readonly deviceList: string[]) {
  }

  getLights (): Promise<Device[]> {
    return this.deviceService.getDevices()
  }

  // async toggleScene (lightConfig: LightConfig, namesOfDevicesToUpdate = this.deviceList): Promise<Device[]> {
  //   const devices = await this.getLights()
  //   let { devicesToUpdate, devicesToPowerOff } = this.deviceService.filterDevicesToUpdate(devices, namesOfDevicesToUpdate)
  //   const isRoomOn = (await this.getLights()).some(({ power }) => power)
  //
  //   if (isRoomOn && this.deviceService.isLightConfigAlreadyInUse(lightConfig)) {
  //     devicesToPowerOff = devices
  //   } else {
  //     for await (const device of this.deviceService.updateDevices(devicesToUpdate, { ...lightConfig, power: true })) {
  //       console.debug(`Device ${device.name} updated.`)
  //     }
  //   }
  //
  //   for await (const device of this.deviceService.updateDevices(devicesToPowerOff, { power: false })) {
  //     console.debug(`Device ${device.name} powered off.`)
  //   }
  //
  //   this.deviceService.lastSelectedLightsConfig = lightConfig
  //
  //   return this.getLights()
  // }
}
