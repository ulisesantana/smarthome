import { LifxService, TplinkService } from '../../infrastructure/providers'
import { Device } from './device.model'
import { DeviceRepository } from './device.repository'
import { Provider } from '../../common'

interface DeviceServiceConstructorParams {
  deviceRepository: DeviceRepository
  tplinkService: TplinkService
  lifxService: LifxService
}

export class DeviceService {
  static readonly warmLight = 2700
  static readonly whiteLight = 6500
  private readonly repository: DeviceRepository
  private readonly tplinkService: TplinkService
  private readonly lifxService: LifxService

  constructor ({ deviceRepository, tplinkService, lifxService }: DeviceServiceConstructorParams) {
    this.repository = deviceRepository
    this.tplinkService = tplinkService
    this.lifxService = lifxService
  }

  getDevices (): Promise<Device[]> {
    return this.repository.findAll()
  }

  async toggleDeviceById (id: string): Promise<Device[]> {
    const device = await this.repository.findById(id)
    if (device.provider === Provider.TpLink) {
      await this.tplinkService.toggleDevice(device)
    }
    if (device.provider === Provider.Lifx) {
      await this.lifxService.toggleDevice(device)
    }
    return this.getDevices()
  }

  async setLightStateById (id: string, config: Partial<Device>): Promise<Device[]> {
    const device = await this.repository.findById(id)
    if (device.provider === Provider.TpLink) {
      await this.tplinkService.setLightState({ ...device, ...config })
    }
    if (device.provider === Provider.Lifx) {
      await this.lifxService.setLightState({ ...device, ...config })
    }
    return this.getDevices()
  }
}
