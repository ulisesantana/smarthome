import { Light, Lights } from '../../light'
import { BrandRepository } from './brand.repository'
import { inject, injectable } from 'tsyringe'
import { BrandLifxRepository } from '../infrastructure/brand.lifx.repository'
import { BrandTplinkRepository } from '../infrastructure/brand.tplink.repository'

export enum Brand {
  TpLink = 'tplink',
  Lifx = 'lifx',
  Unknown = 'unknown'
}

@injectable()
export class BrandService {
  constructor (
    @inject(BrandLifxRepository) private lifxRepository: BrandRepository,
    @inject(BrandTplinkRepository) private tplinkRepository: BrandRepository
  ) {}

  async init (dbLights: Lights): Promise<Lights> {
    const [lifxLights, tplinkLights] = await Promise.all([
      this.lifxRepository.getAllLights(),
      this.tplinkRepository.getAllLights()
    ])
    return new Lights([
      ...this.setLightsAvailability(dbLights.filterByBrand(Brand.Lifx), lifxLights).getAll(),
      ...this.setLightsAvailability(dbLights.filterByBrand(Brand.TpLink), tplinkLights).getAll()
    ])
  }

  async setLightState (light: Light): Promise<void> {
    if (light.brand === Brand.Lifx) {
      await this.lifxRepository.setState(light)
    }
    if (light.brand === Brand.TpLink) {
      await this.tplinkRepository.setState(light)
    }
  }

  private setLightsAvailability (dbLights: Lights, brandLights: Lights): Lights {
    const brandLightsIds = brandLights.getIds()
    return new Lights([
      ...brandLights.getAll(),
      ...dbLights.getAll().map(light => {
        if (!brandLightsIds.includes(light.id)) {
          light.disable()
        }
        return light
      })
    ])
  }
}
