import { LifxService, Provider, TplinkService } from '../../provider'
import { Light } from './light.model'
import { LightRepository } from './light.repository'
import { inject, injectable } from 'tsyringe'

@injectable()
export class LightService {
  static readonly warmLight = 2700
  static readonly whiteLight = 6500

  constructor (
      @inject(LightRepository) private readonly repository: LightRepository,
      @inject(TplinkService) private readonly tplinkService: TplinkService,
      @inject(LifxService) private readonly lifxService: LifxService
  ) {}

  getLights (): Promise<Light[]> {
    return this.repository.findAll()
  }

  getLightsById (ids: string[]): Promise<Light[]> {
    return this.repository.findAllById(ids)
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<Light> {
    const light = await this.repository.findById(id)
    const updatedLight = { ...light, ...config }
    return await this.setLightStateBasedOnProvider(updatedLight)
  }

  async toggleLightById (id: string): Promise<Light> {
    const light = await this.repository.findById(id)
    return await this.setLightStateBasedOnProvider({ ...light, power: !light.power })
  }

  private async setLightStateBasedOnProvider (light: Light): Promise<Light> {
    if (light.provider === Provider.TpLink) {
      await this.tplinkService.setLightState(light)
      await this.repository.upsert(light)
    }
    if (light.provider === Provider.Lifx) {
      await this.lifxService.setLightState(light)
      await this.repository.upsert(light)
    }
    return light
  }
}
