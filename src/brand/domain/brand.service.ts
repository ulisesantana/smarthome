import { Light } from '../../light'
import { BrandRepository } from './brand.repository'
import { inject, injectable } from 'tsyringe'
import { BrandLifxRepository } from '../infrastructure/brand.lifx.repository'
import { BrandTplinkRepository } from '../infrastructure/brand.tplink.repository'

export enum Brand {
  TpLink = 'tplink',
  Lifx = 'lifx',
  Unknown = 'unknown'
}

interface LightsByBrand {
  lifxLights: Light[],
  tplinkLights: Light[]
}

@injectable()
export class BrandService {
  constructor (
    @inject(BrandLifxRepository) private lifxRepository: BrandRepository,
    @inject(BrandTplinkRepository) private tplinkRepository: BrandRepository
  ) {}

  async init (dbLights: Light[]): Promise<Light[]> {
    const {
      lifxLights,
      tplinkLights
    } = this.splitLightsByBrand(dbLights)

    return [
      ...this.setLightsAvailability(lifxLights, await this.lifxRepository.getAllLights()),
      ...this.setLightsAvailability(tplinkLights, await this.tplinkRepository.getAllLights())
    ]
  }

  async setLightState (light: Light): Promise<void> {
    if (light.brand === Brand.Lifx) {
      await this.lifxRepository.setState(light)
    }
    if (light.brand === Brand.TpLink) {
      await this.tplinkRepository.setState(light)
    }
  }

  private setLightsAvailability (dbLights: Light[], brandLights: Light[]): Light[] {
    const brandLightsIds = brandLights.map(({ id }) => id)
    const brandMissingLights = dbLights.filter(({ id }) => !brandLightsIds.includes(id))

    return [
      ...brandLights,
      ...brandMissingLights.map(light => (({
        ...light,
        available: false
      })))
    ]
  }

  private splitLightsByBrand (lights: Light[]): LightsByBrand {
    return lights.reduce<LightsByBrand>((lightsByBrand, light) => {
      if (light.brand === Brand.Lifx) {
        return {
          ...lightsByBrand,
          lifxLights: [...lightsByBrand.lifxLights, light]
        }
      }
      if (light.brand === Brand.TpLink) {
        return {
          ...lightsByBrand,
          tplinkLights: [...lightsByBrand.tplinkLights, light]
        }
      }
      return lightsByBrand
    }, {
      lifxLights: [],
      tplinkLights: []
    })
  }
}
