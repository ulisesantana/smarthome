export interface Device {
  id: string
  name: string
  type: string
  brightness: number
  colorTemp: number
  power: boolean
}

export type LightConfig = Pick<Device, 'brightness' | 'colorTemp'>

export interface DeviceService {
  getDevices: () => Promise<Device[]>
  getDeviceByName: (alias: string) => Promise<Device>
  toggleDeviceByName: (alias: string) => Promise<Device[]>
  toggleDeviceById: (deviceId: string) => Promise<Device[]>
  setLightState: (device: Device) => Promise<Device[]>
}
