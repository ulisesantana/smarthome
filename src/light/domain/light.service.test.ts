import { buildLight } from '../../test'
import { LightService } from './light.service'
import { Light } from './light.model'
import { LifxRepository, LifxService, Provider, TplinkRepository, TplinkService } from '../../provider'
import { LightRepository } from './light.repository'
import { container } from 'tsyringe'

type MockRepositoriesParams = Partial<{
    findById: Light,
    findAll: Light[],
}>

describe('Light service should', () => {
  let lightRepositoryMock: LightRepository
  let tplinkRepositoryMock: TplinkRepository
  let lifxRepositoryMock: LifxRepository
  let tplinkServiceMock: TplinkService
  let lifxServiceMock: LifxService
  let mockRepositories: Function

  beforeEach(() => {
    container.clearInstances()
    lightRepositoryMock = container.resolve(LightRepository)
    tplinkRepositoryMock = container.resolve(TplinkRepository)
    lifxRepositoryMock = container.resolve(LifxRepository)
    tplinkServiceMock = new TplinkService(tplinkRepositoryMock)
    tplinkServiceMock.setLightState = jest.fn()
    container.registerInstance(TplinkService, tplinkServiceMock)

    lifxServiceMock = new LifxService(lifxRepositoryMock)
    lifxServiceMock.setLightState = jest.fn()
    container.registerInstance(LifxService, lifxServiceMock)

    mockRepositories = ({
      findById, findAll
    }: MockRepositoriesParams) => {
      lightRepositoryMock.findById = jest.fn(async () => findById || {} as Light)
      lightRepositoryMock.findAll = jest.fn(async () => findAll || [] as Light[])
      lightRepositoryMock.upsert = jest.fn()
      tplinkRepositoryMock.setState = jest.fn()
      lifxRepositoryMock.setState = jest.fn()
    }
  })
  it('get all devices from database', async () => {
    const mockedLights = Array(2).map(() => buildLight())
    mockRepositories({ findAll: mockedLights })

    const lights = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).getLights()

    expect(lights).toHaveLength(mockedLights.length)
  })

  it('toggle TP-Link device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Provider.TpLink, power: true })
    mockRepositories({ findById: light })

    await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).toggleDeviceById(light.id)

    expect(tplinkServiceMock.setLightState).toHaveBeenCalledWith({ ...light, power: false })
    expect(lifxServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.findById).toHaveBeenCalled()
  })

  it('toggle Lifx device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Provider.Lifx, power: true })
    mockRepositories({ findById: light })

    await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).toggleDeviceById(light.id)

    expect(lifxServiceMock.setLightState).toHaveBeenCalledWith({ ...light, power: false })
    expect(tplinkServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.findById).toHaveBeenCalled()
  })

  it('change light state in TP-Link device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Provider.TpLink })
    const config = { power: false, brightness: 50 }
    mockRepositories({ findById: light })

    await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).setLightStateById(light.id, config)

    expect(tplinkServiceMock.setLightState).toHaveBeenCalledWith({ ...light, ...config })
    expect(lifxServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.findById).toHaveBeenCalled()
  })

  it('change light state in Lifx device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Provider.Lifx })
    const config = { power: false, brightness: 50 }
    mockRepositories({ findById: light })

    await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).setLightStateById(light.id, config)

    expect(lifxServiceMock.setLightState).toHaveBeenCalledWith({ ...light, ...config })
    expect(tplinkServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.findById).toHaveBeenCalled()
  })
})
