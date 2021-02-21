import { Device } from '../domain'
import { LifxService } from '../services'

export class TerraceController {
  private readonly bulb = 'Terraza'

  constructor (private readonly lifxService: LifxService) {}

  getLights (): Device[] {
    return [this.lifxService.getDeviceByName(this.bulb)]
  }

  async toggleTerrace (): Promise<Device[]> {
    await this.lifxService.toggleDeviceByName(this.bulb)
    return this.getLights()
  }
}
