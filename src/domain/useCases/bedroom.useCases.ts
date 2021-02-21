import { Device, RoomService, DeviceService } from '../index'

export class BedroomUseCases {
  private readonly service: RoomService

  constructor (deviceService: DeviceService) {
    this.service = new RoomService(deviceService, [
      DeviceService.tplinkDevices.terraceDoor,
      DeviceService.tplinkDevices.bedroomCorner,
      DeviceService.tplinkDevices.bedroomDoor
    ])
  }

  getLights (): Device[] {
    return this.service.getLights()
  }

  async toggleBedroom (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: DeviceService.warmLight
    })
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: DeviceService.warmLight
    }, ['Puerta Dormitorio'])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: DeviceService.warmLight
    })
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
