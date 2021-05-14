import { BrandLifxService, Brand, BrandTplinkService } from '../../brand'
import { Light } from './light.model'
import { LightRepository } from './light.repository'
import { inject, injectable } from 'tsyringe'
import { LightMongoRepository } from '../infrastructure/light.mongo.repository'

@injectable()
export class LightService {
  static readonly warmLight = 2700
  static readonly whiteLight = 6500

  constructor (
      @inject(LightMongoRepository) private readonly repository: LightRepository,
      @inject(BrandTplinkService) private readonly tplinkService: BrandTplinkService,
      @inject(BrandLifxService) private readonly lifxService: BrandLifxService
  ) {}

  getLights (): Promise<Light[]> {
    return this.repository.getAll()
  }

  getLightsById (ids: string[]): Promise<Light[]> {
    return this.repository.getAllById(ids)
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<Light> {
    const light = await this.repository.getById(id)
    const updatedLight = { ...light, ...config }
    return this.setLightStateBasedOnBrand(updatedLight)
  }

  async toggleLightById (id: string): Promise<Light> {
    const light = await this.repository.getById(id)
    return this.setLightStateBasedOnBrand({ ...light, power: !light.power })
  }

  private async setLightStateBasedOnBrand (light: Light): Promise<Light> {
    if (light.brand === Brand.TpLink) {
      await this.tplinkService.setLightState(light)
      await this.repository.update(light)
    }
    if (light.brand === Brand.Lifx) {
      await this.lifxService.setLightState(light)
      await this.repository.update(light)
    }
    return light
  }
}
