import { Light, Lights } from '../../light'

export interface BrandRepository {
  getAllLights(): Promise<Lights>
  setState(light: Light): Promise<void>
}
