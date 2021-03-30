import { Provider } from '../../common'

export enum DeviceType {
    Bulb = 'bulb',
    Plug = 'plug'
}

export interface Device {
    id: string
    name: string
    type: DeviceType
    brightness: number
    colorTemp: number
    power: boolean
    available: boolean
    provider: Provider
}
