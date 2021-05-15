import { Brand } from '../../brand'

export enum LightType {
    Bulb = 'bulb',
    Plug = 'plug'
}
// TODO: Add logic to at least update the light
// TODO: Add light temp validator with limits
export interface Light {
    id: string
    name: string
    type: LightType
    brightness: number
    colorTemp: number
    power: boolean
    available: boolean
    brand: Brand
}
