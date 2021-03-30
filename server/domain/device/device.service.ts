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

  async setLightStateById (id: string, config: Partial<Device>): Promise<Device[]> {
    const device = await this.repository.findById(id)
    const updatedDevice = { ...device, ...config }
    await this.setLightStateBasedOnProvider(updatedDevice)
    return this.getDevices()
  }

  async toggleDeviceById (id: string): Promise<Device[]> {
    const device = await this.repository.findById(id)
    await this.setLightStateBasedOnProvider({ ...device, power: !device.power })
    return this.getDevices()
  }

  private async setLightStateBasedOnProvider (device: Device): Promise<void> {
    if (device.provider === Provider.TpLink) {
      await this.tplinkService.setLightState(device)
      await this.repository.upsert(device)
    }
    if (device.provider === Provider.Lifx) {
      await this.lifxService.setLightState(device)
      await this.repository.upsert(device)
    }
  }
}
