import { Light } from '../../light'

export interface BrandRepository {
  getAllLights(): Promise<Light[]>
  setState(light: Light): Promise<void>
}
