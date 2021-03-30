export enum Provider {
  TpLink = 'tplink',
  Lifx = 'lifx'
}

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
  provider: Provider
}

export type LightConfig = Pick<Device, 'brightness' | 'colorTemp'>

export interface ProviderService {
  fetchDevices: () => Promise<Device[]>
  getDevices: () => Device[]
  getDeviceByName: (name: string) => Device
  toggleDeviceByName: (name: string) => Promise<Device[]>
  toggleDeviceById: (deviceId: string) => Promise<Device[]>
  setLightState: (device: Device) => Promise<Device[]>
}
