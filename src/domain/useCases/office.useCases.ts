import { Device, RoomService, DeviceService } from '../index'

export class OfficeUseCases {
  private readonly service: RoomService

  constructor (deviceService: DeviceService) {
    this.service = new RoomService(deviceService, [
      DeviceService.tplinkDevices.deskLight,
      DeviceService.lifxDevices.leftLamp,
      DeviceService.lifxDevices.rightLamp,
      DeviceService.lifxDevices.stairs
    ])
  }

  getLights (): Device[] {
    return this.service.getLights()
  }

  async toggleOffice (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: DeviceService.warmLight
    }, this.service.deviceList.filter(name => name !== DeviceService.lifxDevices.rightLamp))
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 5,
      colorTemp: DeviceService.warmLight
    }, [DeviceService.lifxDevices.leftLamp, DeviceService.lifxDevices.rightLamp])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: DeviceService.warmLight
    }, [DeviceService.lifxDevices.leftLamp, DeviceService.lifxDevices.rightLamp])
  }

  async toggleNightScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 50,
      colorTemp: DeviceService.warmLight
    })
  }

  async toggleDayScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: DeviceService.whiteLight
    })
  }
}
