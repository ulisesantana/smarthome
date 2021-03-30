import { Device } from '../device.model'
import { Provider, ProviderRepository, ProviderService } from '../../../common'
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
    setState: (device: Device) => Promise<void>,
}>

type Constructor<T> = new (...args: any[]) => T;

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

export function buildTplinkService (mockRepository: ProviderMockRepository = {}): TplinkService {
  return buildProviderService(
    TplinkService,
    new TplinkRepository('irrelevantUser', 'irrelevantPassword'),
    mockRepository
  )
}

export function buildLifxService (mockRepository: ProviderMockRepository = {}): LifxService {
  return buildProviderService(
    LifxService,
    new LifxRepository('irrelevantToken'),
    mockRepository
  )
}

function buildProviderService<T extends ProviderService> (
  ServiceConstructor: Constructor<T>,
  repository: ProviderRepository,
  mockRepository: ProviderMockRepository = {}
): T {
  repository.getAllDevices = mockFunction(mockRepository.getAllDevices)
  repository.setState = mockFunction(mockRepository.setState)
  return new ServiceConstructor(repository)
}

function mockFunction<Return, Params extends any[]> (fn?: (...args: Params) => Return) {
  return fn ? jest.fn<Return, Params>(fn) : jest.fn<Return, Params>()
}
