import { Device } from '../domain'
import { LifxService } from '../services'

export class TerraceController {
  private readonly bulb = 'Terraza'

  constructor (private readonly lifxService: LifxService) {}

  async toggleTerrace (): Promise<Device[]> {
    return await this.lifxService.toggleDeviceByName(this.bulb)
  }
}
