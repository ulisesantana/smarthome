import { Light } from './light.model'
import { Brand } from '../../brand'

export interface LightRepository {
    getAll (): Promise<Light[]>
    getAllById (ids: string[]): Promise<Light[]>
    getById (id: string): Promise<Light>
    getAllByProvider (provider: Brand): Promise<Light[]>
    update (device: Light): Promise<Light>
}
