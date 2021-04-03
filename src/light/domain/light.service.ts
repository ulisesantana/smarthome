import { LifxService, Provider, TplinkService } from '../../provider'
import { Light } from './light.model'
import { LightRepository } from './light.repository'
import { inject, injectable } from 'tsyringe'

@injectable()
export class LightService {
  static readonly warmLight = 2700
  static readonly whiteLight = 6500

  constructor (
      @inject(LightRepository) private readonly repository: LightRepository,
      @inject(TplinkService) private readonly tplinkService: TplinkService,
      @inject(LifxService) private readonly lifxService: LifxService
  ) {}

  getLights (): Promise<Light[]> {
    return this.repository.findAll()
  }

  getLightsById (ids: string[]): Promise<Light[]> {
    return this.repository.findAllById(ids)
  }

  async setLightStateById (id: string, config: Partial<Light>): Promise<void> {
    const device = await this.repository.findById(id)
    const updatedDevice = { ...device, ...config }
    await this.setLightStateBasedOnProvider(updatedDevice)
  }

  async toggleDeviceById (id: string): Promise<void> {
    const device = await this.repository.findById(id)
    await this.setLightStateBasedOnProvider({ ...device, power: !device.power })
  }

  private async setLightStateBasedOnProvider (device: Light): Promise<void> {
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
