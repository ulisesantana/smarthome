import { Device } from '../device.model'
import { Provider } from '../../../common'
import { DeviceRepository } from '../device.repository'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from '../../../infrastructure/providers'

type DeviceMockRepository = Partial<{
    findAll: () => Promise<Device[]>,
    findById: (id: string) => Promise<Device>,
    findAllByProvider: (provider: Provider) => Promise<Device[]>,
    upsert: (device: Device) => Promise<Device>,
}>

type ProviderMockRepository = Partial<{
    getAllDevices: () => Promise<Device[]>,
    setState: (device: Device) => Promise<Device>,
}>

export function buildDeviceRepository ({
  findAll,
  findAllByProvider,
  findById,
  upsert
}: DeviceMockRepository = {}): DeviceRepository {
  const deviceMockRepository = new DeviceRepository()
  deviceMockRepository.findAll = mockFunction(findAll)
  deviceMockRepository.findById = mockFunction(findById)
  deviceMockRepository.findAllByProvider = mockFunction(findAllByProvider)
  deviceMockRepository.upsert = mockFunction(upsert)
  return deviceMockRepository
}

export function buildTplinkService (deviceMockRepository: DeviceRepository, {
  getAllDevices,
  setState
}: ProviderMockRepository = {}): TplinkService {
  const tplinkMockRepository = new TplinkRepository('irrelevantUser', 'irrelevantPassword')
  tplinkMockRepository.getAllDevices = mockFunction(getAllDevices)
  tplinkMockRepository.setState = mockFunction(setState)
  return new TplinkService(tplinkMockRepository, deviceMockRepository)
}

export function buildLifxService (deviceMockRepository: DeviceRepository, {
  getAllDevices,
  setState
}: ProviderMockRepository = {}): LifxService {
  const lifxMockRepository = new LifxRepository('irrelevantToken')
  lifxMockRepository.getAllDevices = mockFunction(getAllDevices)
  lifxMockRepository.setState = mockFunction(setState)
  return new LifxService(lifxMockRepository, deviceMockRepository)
}

function mockFunction<Return, Params extends any[]> (fn?: (...args: Params) => Return) {
  return fn ? jest.fn<Return, Params>(fn) : jest.fn<Return, Params>()
}
