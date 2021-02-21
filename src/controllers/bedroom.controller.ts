import { Device } from '../domain'
import { TplinkService, BedroomService } from '../services'

export class BedroomController {
  private readonly service: BedroomService

  constructor (tplinkService: TplinkService) {
    this.service = new BedroomService(tplinkService)
  }

  getLights (): Device[] {
    return this.service.getLights()
  }

  async toggleBedroom (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: this.service.warmLight
    })
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: this.service.warmLight
    }, ['Puerta Dormitorio'])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: this.service.warmLight
    })
  }

  async toggleNightScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 50,
      colorTemp: this.service.warmLight
    })
  }

  async toggleDayScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: this.service.whiteLight
    })
  }
}
