import { buildDeviceRepository, buildLifxService, buildTplinkService, buildDevice } from '../../common/test'
import { DeviceService, DeviceServiceConstructorParams } from './device.service'
import { Provider } from '../../common'
import { Device } from './device.model'

describe('Device service should', () => {
  it('get all devices from database', async () => {
    const mockDevices = Array(2).map(() => buildDevice())
    const deviceRepository = buildDeviceRepository({
      findAll: async () => mockDevices
    })
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService: buildTplinkService(),
      lifxService: buildLifxService()
    })

    const devices = await deviceService.getDevices()

    expect(devices).toHaveLength(mockDevices.length)
  })

  it('toggle TP-Link device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.TpLink, power: true })
    const { deviceRepository, lifxService, tplinkService } = prepareDeviceService(device)
    const deviceService = new DeviceService({ deviceRepository, lifxService, tplinkService })

    await deviceService.toggleDeviceById(device.id)

    expect(tplinkService.setLightState).toHaveBeenCalledWith({ ...device, power: false })
    expect(lifxService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('toggle Lifx device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.Lifx, power: true })
    const { deviceRepository, lifxService, tplinkService } = prepareDeviceService(device)
    const deviceService = new DeviceService({ deviceRepository, lifxService, tplinkService })

    await deviceService.toggleDeviceById(device.id)

    expect(lifxService.setLightState).toHaveBeenCalledWith({ ...device, power: false })
    expect(tplinkService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('change light state in TP-Link device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.TpLink })
    const config = { power: false, brightness: 50 }
    const { deviceRepository, lifxService, tplinkService } = prepareDeviceService(device)
    const deviceService = new DeviceService({ deviceRepository, lifxService, tplinkService })

    await deviceService.setLightStateById(device.id, config)

    expect(tplinkService.setLightState).toHaveBeenCalledWith({ ...device, ...config })
    expect(lifxService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('change light state in Lifx device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.Lifx })
    const config = { power: false, brightness: 50 }
    const { deviceRepository, lifxService, tplinkService } = prepareDeviceService(device)
    const deviceService = new DeviceService({ deviceRepository, lifxService, tplinkService })

    await deviceService.setLightStateById(device.id, config)

    expect(lifxService.setLightState).toHaveBeenCalledWith({ ...device, ...config })
    expect(tplinkService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })
})

function prepareDeviceService (device: Device): DeviceServiceConstructorParams {
  const deviceRepository = buildDeviceRepository({
    findById: async () => device
  })
  const tplinkService = buildTplinkService()
  const lifxService = buildLifxService()
  tplinkService.setLightState = jest.fn()
  lifxService.setLightState = jest.fn()
  return {
    deviceRepository,
    lifxService,
    tplinkService
  }
}
