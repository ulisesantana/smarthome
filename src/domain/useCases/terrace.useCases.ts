import { Device, RoomService, DeviceService } from '../index'

export class TerraceUseCases {
  private readonly service: RoomService

  constructor (deviceService: DeviceService) {
    this.service = new RoomService(deviceService, [
      DeviceService.lifxDevices.terrace
    ])
  }

  getLights (): Device[] {
    return this.service.getLights()
  }

  async toggleTerrace (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: DeviceService.warmLight
    })
  }
}
