import { Light } from './light.model'
import { Lights } from './lights.model'

export interface LightRepository {
    getAll (): Promise<Lights>
    getAllById (ids: string[]): Promise<Lights>
    getById (id: string): Promise<Light>
    update (light: Light): Promise<Light>
}
