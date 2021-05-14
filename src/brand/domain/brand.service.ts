import { Light } from '../../light'
import { BrandRepository } from './brand.repository'

export enum Brand {
    TpLink = 'tplink',
    Lifx = 'lifx',
    Unknown = 'unknown'
}

export abstract class BrandService {
  protected constructor (private readonly repository: BrandRepository) {}

  async init (dbLights: Light[]): Promise<Light[]> {
    const brandLights = await this.repository.getAllLights()
    const brandLightsIds = brandLights.map(({ id }) => id)
    const brandMissingLights = dbLights.filter(({ id }) => !brandLightsIds.includes(id))

    return [
      ...brandLights,
      ...brandMissingLights.map(light => (({ ...light, available: false })))
    ]
  }

  async setLightState (light: Light): Promise<void> {
    await this.repository.setState(light)
  }
}
