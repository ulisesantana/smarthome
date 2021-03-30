import { buildDeviceRepository, buildLifxService, buildTplinkService } from './device.service.build'
import { buildDevice } from './device.build'
import { DeviceService } from '../device.service'
import { Provider } from '../../../common'

describe('Device service should', () => {
  it('get all devices from database', async () => {
    const mockDevices = Array(2).map(() => buildDevice())
    const deviceRepository = buildDeviceRepository({
      findAll: async () => mockDevices
    })
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService: buildTplinkService(deviceRepository),
      lifxService: buildLifxService(deviceRepository)
    })

    const devices = await deviceService.getDevices()

    expect(devices).toHaveLength(mockDevices.length)
  })

  it('retrieve all devices after toggling one', async () => {
    const mockDevices = Array.from({ length: 4 }).map(() => buildDevice())
    const deviceRepository = buildDeviceRepository({
      findById: async () => mockDevices[0],
      findAll: async () => mockDevices
    })
    const tplinkService = buildTplinkService(deviceRepository)
    const lifxService = buildLifxService(deviceRepository)
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService,
      lifxService
    })

    const updatedDevices = await deviceService.toggleDeviceById(mockDevices[0].id)

    expect(updatedDevices).toStrictEqual(mockDevices)
    expect(deviceRepository.findAll).toHaveBeenCalled()
  })

  it('toggle TP-Link device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.TpLink })
    const deviceRepository = buildDeviceRepository({
      findById: async () => device
    })
    const tplinkService = buildTplinkService(deviceRepository)
    const lifxService = buildLifxService(deviceRepository)
    tplinkService.toggleDevice = jest.fn()
    lifxService.toggleDevice = jest.fn()
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService,
      lifxService
    })

    await deviceService.toggleDeviceById(device.id)

    expect(tplinkService.toggleDevice).toHaveBeenCalledWith(device)
    expect(lifxService.toggleDevice).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('toggle Lifx device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.Lifx })
    const deviceRepository = buildDeviceRepository({
      findById: async () => device
    })
    const tplinkService = buildTplinkService(deviceRepository)
    const lifxService = buildLifxService(deviceRepository)
    tplinkService.toggleDevice = jest.fn()
    lifxService.toggleDevice = jest.fn()
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService,
      lifxService
    })

    await deviceService.toggleDeviceById(device.id)

    expect(lifxService.toggleDevice).toHaveBeenCalledWith(device)
    expect(tplinkService.toggleDevice).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('change light state in TP-Link device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.TpLink })
    const config = { power: false, brightness: 50 }

    const deviceRepository = buildDeviceRepository({
      findById: async () => device
    })
    const tplinkService = buildTplinkService(deviceRepository)
    const lifxService = buildLifxService(deviceRepository)
    tplinkService.setLightState = jest.fn()
    lifxService.setLightState = jest.fn()
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService,
      lifxService
    })

    await deviceService.setLightStateById(device.id, config)

    expect(tplinkService.setLightState).toHaveBeenCalledWith({ ...device, ...config })
    expect(lifxService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })

  it('change light state in Lifx device by id', async () => {
    const device = buildDevice({ id: 'irrelevantDevice', provider: Provider.Lifx })
    const config = { power: false, brightness: 50 }
    const deviceRepository = buildDeviceRepository({
      findById: async () => device
    })
    const tplinkService = buildTplinkService(deviceRepository)
    const lifxService = buildLifxService(deviceRepository)
    tplinkService.setLightState = jest.fn()
    lifxService.setLightState = jest.fn()
    const deviceService = new DeviceService({
      deviceRepository,
      tplinkService,
      lifxService
    })

    await deviceService.setLightStateById(device.id, config)

    expect(lifxService.setLightState).toHaveBeenCalledWith({ ...device, ...config })
    expect(tplinkService.setLightState).not.toHaveBeenCalled()
    expect(deviceRepository.findById).toHaveBeenCalled()
  })
})
