import { Light } from './light.model'
import { Brand } from '../../brand/domain/brand.service'

export class Lights {
  constructor (private values: Light[] = []) {}

  anyLightIsPoweredUp (): boolean {
    return this.values.some(({ power }) => power)
  }

  filterByBrand (brand: Brand): Lights {
    return new Lights(this.values.filter(light => light.brand === brand))
  }

  getAll (): Light[] {
    return this.values
  }

  getIds (): string[] {
    return this.values.map(({ id }) => id)
  }
}
