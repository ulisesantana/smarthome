import { DeviceService } from './device.service'
import { Device } from './device.model'
import { DeviceRepository } from './device.repository'
import { Provider, ProviderService } from '../../common'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from '../../infrastructure/providers'

interface InitializedProviderService {
    service: ProviderService,
    devicesToUpdate: Device[]
}

export class DeviceController {
  constructor (private readonly service: DeviceService) {
  }

  getDevices (): Promise<Device[]> {
    return this.service.getDevices()
  }

  async setLightStateById (id: string, config: Partial<Device>): Promise<Device[]> {
    await this.service.setLightStateById(id, config)
    return this.getDevices()
  }

  async toggleDeviceById (id: string): Promise<Device[]> {
    await this.service.toggleDeviceById(id)
    return this.getDevices()
  }

  static async build (repository = new DeviceRepository()): Promise<DeviceController> {
    const { service: lifxService, devicesToUpdate: lifxDevicesToUpdate } = await DeviceController.loadLifxService(
      await repository.findAllByProvider(Provider.Lifx)
    )

    const { service: tplinkService, devicesToUpdate: tplinkDevicesToUpdate } = await DeviceController.loadTplinkService(
      await repository.findAllByProvider(Provider.TpLink)
    )

    const updatedDevices = DeviceController.updateDevices(
      [...lifxDevicesToUpdate, ...tplinkDevicesToUpdate],
      repository.upsert.bind(repository)
    )
    for await (const device of updatedDevices) {
      if (device.available) {
        console.debug(`Found light ${device.name}`)
      } else {
        console.debug(`Light ${device.name} not found.`)
      }
    }

    return new DeviceController(new DeviceService({
      deviceRepository: repository,
      lifxService,
      tplinkService
    }))
  }

  private static async loadLifxService (dbDevices: Device[]): Promise<InitializedProviderService> {
    const lifxToken = process.env.LIFX_TOKEN ?? ''
    const lifx = new LifxService(new LifxRepository(lifxToken))
    const devicesToUpdate = await lifx.init(dbDevices)
    return { service: lifx, devicesToUpdate }
  }

  private static async loadTplinkService (dbDevices: Device[]): Promise<InitializedProviderService> {
    const tplinkUser = process.env.TPLINK_USER ?? ''
    const tplinkPassword = process.env.TPLINK_PASS ?? ''
    const tplink = new TplinkService(new TplinkRepository(tplinkUser, tplinkPassword))
    const devicesToUpdate = await tplink.init(dbDevices)
    return { service: tplink, devicesToUpdate }
  }

  private static async * updateDevices (devices: Device[], update: (device: Device) => Promise<Device>): AsyncGenerator<Device> {
    for (const device of devices) {
      const updatedDevice = await update(device)
      yield updatedDevice
    }
  }
}
