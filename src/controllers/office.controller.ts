import { LifxService, TplinkService, OfficeService } from '../services'
import { Device } from '../domain'

export class OfficeController {
  private readonly service: OfficeService
  constructor (
    tplinkService: TplinkService,
    lifxService: LifxService
  ) {
    this.service = new OfficeService(tplinkService, lifxService)
  }

  getLights (): Device[] {
    return this.service.getLights()
  }

  async toggleOffice (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 100,
      colorTemp: this.service.warmLight
    }, [...this.service.bulbs, this.service.plug].filter(name => name !== 'Lámpara Derecha'))
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 5,
      colorTemp: this.service.warmLight
    }, ['Lámpara Izquierda', 'Lámpara Derecha'])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.service.toggleScene({
      brightness: 10,
      colorTemp: this.service.warmLight
    }, ['Lámpara Izquierda', 'Lámpara Derecha'])
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
