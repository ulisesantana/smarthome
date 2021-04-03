import { LightService, Light } from '..'
import { inject, injectable } from 'tsyringe'

@injectable()
export class LightController {
  constructor (@inject(LightService) private readonly lightService: LightService) {
  }

  getLights (): Promise<Light[]> {
    return this.lightService.getLights()
  }

  setLightStateById (id: string, config: Partial<Light>): Promise<Light> {
    return this.lightService.setLightStateById(id, config)
  }

  toggleLightById (id: string): Promise<Light> {
    return this.lightService.toggleLightById(id)
  }
}
