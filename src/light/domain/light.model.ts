import { Provider } from '../../provider'

export enum LightType {
    Bulb = 'bulb',
    Plug = 'plug'
}

export interface Light {
    id: string
    name: string
    type: LightType
    brightness: number
    colorTemp: number
    power: boolean
    available: boolean
    provider: Provider
}
