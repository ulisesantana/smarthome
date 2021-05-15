import { Light } from './light.model'

export interface LightRepository {
    getAll (): Promise<Light[]>
    getAllById (ids: string[]): Promise<Light[]>
    getById (id: string): Promise<Light>
    update (device: Light): Promise<Light>
}
