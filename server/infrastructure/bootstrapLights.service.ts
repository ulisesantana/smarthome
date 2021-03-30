import { Device, DeviceRepository } from '../domain'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from './providers'
import { Provider, ProviderService } from '../common'

interface InitializedProviderService {
    service: ProviderService,
    devicesToUpdate: Device[]
}

export class BootstrapLightsService {
  constructor (private readonly deviceRepository: DeviceRepository) {
  }

  async init (): Promise<{tplinkService: ProviderService, lifxService: ProviderService}> {
    const { service: lifxService, devicesToUpdate: lifxDevicesToUpdate } = await this.loadLifxService(
      await this.deviceRepository.findAllByProvider(Provider.Lifx)
    )

    const { service: tplinkService, devicesToUpdate: tplinkDevicesToUpdate } = await this.loadTplinkService(
      await this.deviceRepository.findAllByProvider(Provider.TpLink)
    )

    for await (const device of this.updateDevices([...lifxDevicesToUpdate, ...tplinkDevicesToUpdate])) {
      if (device.available) {
        console.debug(`Found light ${device.name}`)
      } else {
        console.debug(`Light ${device.name} not found.`)
      }
    }

    return { lifxService, tplinkService }
  }

  async loadLifxService (dbDevices: Device[]): Promise<InitializedProviderService> {
    const lifxToken = process.env.LIFX_TOKEN ?? ''
    const lifx = new LifxService(new LifxRepository(lifxToken))
    const devicesToUpdate = await lifx.init(dbDevices)
    return { service: lifx, devicesToUpdate }
  }

  async loadTplinkService (dbDevices: Device[]): Promise<InitializedProviderService> {
    const tplinkUser = process.env.TPLINK_USER ?? ''
    const tplinkPassword = process.env.TPLINK_PASS ?? ''
    const tplink = new TplinkService(new TplinkRepository(tplinkUser, tplinkPassword))
    const devicesToUpdate = await tplink.init(dbDevices)
    return { service: tplink, devicesToUpdate }
  }

  private async * updateDevices (devices: Device[]): AsyncGenerator<Device> {
    for (const device of devices) {
      await this.deviceRepository.upsert(device)
      yield device
    }
  }
}
