import { Light } from '../../light'

export interface LightGroup {
    id: string
    name: string
    color: string
    icon: string
    lights: Light[]
}

export type LightGroupEntity = Omit<LightGroup, 'lights'> & {
    lights: string[]
}
