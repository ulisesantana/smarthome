import { LightService, Light, LightType } from '..'
import { inject, injectable } from 'tsyringe'
import { Brand } from '../../brand'

export interface LightResponse {
  id: string
  name: string
  type: LightType
  brightness: number
  colorTemp: number
  power: boolean
  available: boolean
  brand: Brand
}

@injectable()
export class LightController {
  constructor (@inject(LightService) private readonly lightService: LightService) {
  }

  async getLights (): Promise<LightResponse[]> {
    return (await this.lightService.getLights()).getAll().map(LightController.mapToJSON)
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<LightResponse> {
    return LightController.mapToJSON(await this.lightService.setLightStateById(id, config))
  }

  async toggleLightById (id: string): Promise<LightResponse> {
    return LightController.mapToJSON(await this.lightService.toggleLightById(id))
  }

  private static mapToJSON (light: Light): LightResponse {
    return {
      id: light.id,
      name: light.name,
      type: light.type,
      brightness: light.brightness,
      colorTemp: light.colorTemp,
      power: light.power,
      available: light.available,
      brand: light.brand
    }
  }
}
