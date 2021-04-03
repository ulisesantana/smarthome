import { LightService, Light } from '..'
import { inject, injectable } from 'tsyringe'

@injectable()
export class LightController {
  constructor (@inject(LightService) private readonly deviceService: LightService) {
  }

  getDevices (): Promise<Light[]> {
    return this.deviceService.getLights()
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<Light[]> {
    await this.deviceService.setLightStateById(id, config)
    return this.getDevices()
  }

  async toggleDeviceById (id: string): Promise<Light[]> {
    await this.deviceService.toggleDeviceById(id)
    return this.getDevices()
  }
}
