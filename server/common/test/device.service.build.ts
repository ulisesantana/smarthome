import { Device, DeviceRepository, DeviceService } from '../../domain'
import { Provider, ProviderRepository, ProviderService } from '../index'
import { LifxRepository, LifxService, TplinkRepository, TplinkService } from '../../infrastructure/providers'
import { mockFunction } from './mockFunction'

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

type BuildDeviceServiceParams = Partial<{
    deviceMockRepository: DeviceMockRepository,
    tplinkMockRepository: ProviderMockRepository,
    lifxMockRepository: ProviderMockRepository
}>

export function buildDeviceService ({
  deviceMockRepository,
  lifxMockRepository,
  tplinkMockRepository
}: BuildDeviceServiceParams = {}): DeviceService {
  return new DeviceService({
    deviceRepository: buildDeviceRepository(deviceMockRepository),
    tplinkService: buildTplinkService(tplinkMockRepository),
    lifxService: buildLifxService(lifxMockRepository)
  })
}

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
