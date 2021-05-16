import { Light, Lights } from '../../light'

export interface LightGroup {
    id: string
    name: string
    color: string
    icon: string
    lights: Lights
}

export type LightGroupEntity = Omit<LightGroup, 'lights'> & {
    lights: string[]
}

export type RawLightGroup = Omit<LightGroup, 'lights'> & {
    lights: Light[]
}
