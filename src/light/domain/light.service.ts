import { BrandService } from '../../brand'
import { Light } from './light.model'
import { LightRepository } from './light.repository'
import { inject, injectable } from 'tsyringe'
import { LightMongoRepository } from '../infrastructure/light.mongo.repository'
import { Lights } from './lights.model'

@injectable()
export class LightService {
  constructor (
      @inject(LightMongoRepository) private readonly repository: LightRepository,
      @inject(BrandService) private readonly brandService: BrandService
  ) {}

  getLights (): Promise<Lights> {
    return this.repository.getAll()
  }

  getLightsById (ids: string[]): Promise<Lights> {
    return this.repository.getAllById(ids)
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<Light> {
    const light = await this.repository.getById(id)
    light.updateState(config)
    return this.setLightState(light)
  }

  async toggleLightById (id: string): Promise<Light> {
    const light = await this.repository.getById(id)
    light.togglePower()
    return this.setLightState(light)
  }

  async saveLight (light: Light): Promise<Light> {
    return await this.repository.update(light)
  }

  private async setLightState (light: Light): Promise<Light> {
    await this.brandService.setLightState(light)
    return this.saveLight(light)
  }
}
