import { DeviceService, Device, DeviceRepository } from './device'
import { Room, RoomEntity, RoomService } from './room'
import { Provider, ProviderService } from '../common'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from '../infrastructure/providers'

interface InitializedProviderService {
    service: ProviderService,
    devicesToUpdate: Device[]
}

export class LightsController {
  constructor (private readonly deviceService: DeviceService, private readonly roomService: RoomService) {
  }

  getDevices (): Promise<Device[]> {
    return this.deviceService.getDevices()
  }

  async setLightStateById (id: string, config: Partial<Device>): Promise<Device[]> {
    await this.deviceService.setLightStateById(id, config)
    return this.getDevices()
  }

  async toggleDeviceById (id: string): Promise<Device[]> {
    await this.deviceService.toggleDeviceById(id)
    return this.getDevices()
  }

  async getRoomById (id: string): Promise<Room> {
    return this.roomService.getById(id)
  }

  getRooms (): Promise<Room[]> {
    return this.roomService.getAll()
  }

  async createRoom (room: Partial<RoomEntity>): Promise<Room> {
    return this.roomService.create(room)
  }

  updateRoom (id: string, room: Partial<Room>): Promise<Room> {
    return this.roomService.update(id, room)
  }

  async removeRoom (id: string): Promise<void> {
    await this.roomService.remove(id)
  }

  async toggleRoomById (id: string): Promise<Device[]> {
    await this.roomService.toggleDevicesByRoomId(id)
    return this.getDevices()
  }

  static async build (repository = new DeviceRepository()): Promise<LightsController> {
    const { service: lifxService, devicesToUpdate: lifxDevicesToUpdate } = await LightsController.loadLifxService(
      await repository.findAllByProvider(Provider.Lifx)
    )

    const { service: tplinkService, devicesToUpdate: tplinkDevicesToUpdate } = await LightsController.loadTplinkService(
      await repository.findAllByProvider(Provider.TpLink)
    )

    const updatedDevices = LightsController.updateDevices(
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

    const deviceService = new DeviceService({
      deviceRepository: repository,
      lifxService,
      tplinkService
    })
    return new LightsController(
      deviceService,
      new RoomService(deviceService)
    )
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
