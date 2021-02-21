import { Device, LightConfig, Provider } from '../index'
import { TplinkService, LifxService } from '../../infrastructure/providers'

export class DeviceService {
  static readonly warmLight = 2700
  static readonly whiteLight = 6500
  static readonly tplinkDevices = {
    deskLight: 'Lampara estudio',
    terraceDoor: 'Puerta Terraza',
    bedroomCorner: 'Esquina Dormitorio',
    bedroomDoor: 'Puerta Dormitorio'
  }

  static readonly lifxDevices = {
    leftLamp: 'Lámpara Izquierda',
    rightLamp: 'Lámpara Derecha',
    stairs: 'Entrada Escalera',
    terrace: 'Terraza'
  }

  private readonly lifxDevicesList = Object.values(DeviceService.lifxDevices)
  private readonly tplinkDevicesList = Object.values(DeviceService.tplinkDevices)

  lastSelectedLightsConfig: LightConfig = {
    colorTemp: DeviceService.warmLight,
    brightness: 0
  }

  constructor (private readonly tplinkService: TplinkService, private readonly lifxService: LifxService) {
  }

  async fetchDevices (): Promise<Device[]> {
    const devices = await Promise.all([
      this.lifxService.fetchDevices(),
      this.tplinkService.fetchDevices()
    ])
    return devices.flat()
  }

  async toggleDeviceById (id: string): Promise<Device[]> {
    const devices = await Promise.all([
      this.lifxService.toggleDeviceById(id),
      this.tplinkService.toggleDeviceById(id)
    ])
    return devices.flat()
  }

  getDevices (deviceList: string[]): Device[] {
    return [
      deviceList
        .filter(device => this.tplinkDevicesList.includes(device))
        .map(this.tplinkService.getDeviceByName.bind(this.tplinkService)),
      deviceList
        .filter(device => this.lifxDevicesList.includes(device))
        .map(this.lifxService.getDeviceByName.bind(this.lifxService))
    ].flat()
  }

  async * updateDevices (devices: Device[], config: Partial<Device>): AsyncGenerator<Device> {
    for (const device of devices) {
      const updatedDevice = { ...device, ...config }
      device.provider === Provider.TpLink
        ? await this.tplinkService.setLightState(updatedDevice)
        : await this.lifxService.setLightState(updatedDevice)
      yield updatedDevice
    }
  }

  filterDevicesToUpdate (devices: Device[], namesOfDevicesToUpdate: string[]): { devicesToUpdate: Device[], devicesToPowerOff: Device[] } {
    return devices.reduce(
      ({ devicesToUpdate, devicesToPowerOff }, device) => namesOfDevicesToUpdate.includes(device.name)
        ? { devicesToUpdate: [...devicesToUpdate, device], devicesToPowerOff }
        : { devicesToUpdate, devicesToPowerOff: [...devicesToPowerOff, device] }
      , { devicesToUpdate: [] as Device[], devicesToPowerOff: [] as Device[] }
    )
  }

  isLightConfigAlreadyInUse (lightsConfig: LightConfig): boolean {
    return JSON.stringify(lightsConfig) === JSON.stringify(this.lastSelectedLightsConfig)
  }
}
