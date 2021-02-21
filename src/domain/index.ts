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
  fetchDevices: () => Promise<Device[]>
  getDevices: () => Device[]
  getDeviceByName: (name: string) => Device
  toggleDeviceByName: (name: string) => Promise<Device[]>
  toggleDeviceById: (deviceId: string) => Promise<Device[]>
  setLightState: (device: Device) => Promise<Device[]>
}
