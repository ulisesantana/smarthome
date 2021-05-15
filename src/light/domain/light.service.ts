import { BrandService } from '../../brand'
import { Light } from './light.model'
import { LightRepository } from './light.repository'
import { inject, injectable } from 'tsyringe'
import { LightMongoRepository } from '../infrastructure/light.mongo.repository'

@injectable()
export class LightService {
  // Move this to Light
  static readonly warmLight = 2700
  static readonly whiteLight = 6500

  constructor (
      @inject(LightMongoRepository) private readonly repository: LightRepository,
      @inject(BrandService) private readonly brandService: BrandService
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
    return this.setLightState(updatedLight)
  }

  async toggleLightById (id: string): Promise<Light> {
    const light = await this.repository.getById(id)
    return this.setLightState({ ...light, power: !light.power })
  }

  async updateLight (light: Light): Promise<Light> {
    return await this.repository.update(light)
  }

  private async setLightState (light: Light): Promise<Light> {
    await this.brandService.setLightState(light)
    await this.repository.update(light)
    return light
  }
}
