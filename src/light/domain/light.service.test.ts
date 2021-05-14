import { buildLight } from '../../common/test'
import { LightService } from './light.service'
import { Light } from './light.model'
import { BrandLifxRepository, BrandLifxService, Brand, BrandTplinkRepository, BrandTplinkService } from '../../brand'
import { LightRepository } from './light.repository'
import { container } from 'tsyringe'
import { LightMongoRepository } from '../infrastructure/light.mongo.repository'

type MockRepositoriesParams = Partial<{
    getById: Light,
    getAll: Light[],
}>

describe('Light service should', () => {
  let lightRepositoryMock: LightRepository
  let tplinkRepositoryMock: BrandTplinkRepository
  let lifxRepositoryMock: BrandLifxRepository
  let tplinkServiceMock: BrandTplinkService
  let lifxServiceMock: BrandLifxService
  let mockRepositories: Function

  beforeEach(() => {
    container.clearInstances()
    lightRepositoryMock = container.resolve(LightMongoRepository)
    tplinkRepositoryMock = container.resolve(BrandTplinkRepository)
    lifxRepositoryMock = container.resolve(BrandLifxRepository)
    tplinkServiceMock = new BrandTplinkService(tplinkRepositoryMock)
    tplinkServiceMock.setLightState = jest.fn()
    container.registerInstance(BrandTplinkService, tplinkServiceMock)

    lifxServiceMock = new BrandLifxService(lifxRepositoryMock)
    lifxServiceMock.setLightState = jest.fn()
    container.registerInstance(BrandLifxService, lifxServiceMock)

    mockRepositories = ({
      getById, getAll
    }: MockRepositoriesParams) => {
      lightRepositoryMock.getById = jest.fn(async () => getById || {} as Light)
      lightRepositoryMock.getAll = jest.fn(async () => getAll || [] as Light[])
      lightRepositoryMock.update = jest.fn()
      tplinkRepositoryMock.setState = jest.fn()
      lifxRepositoryMock.setState = jest.fn()
    }
  })
  it('get all devices from database', async () => {
    const mockedLights = Array(2).map(() => buildLight())
    mockRepositories({ getAll: mockedLights })

    const lights = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).getLights()

    expect(lights).toHaveLength(mockedLights.length)
  })

  it('toggle TP-Link device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Brand.TpLink, power: true })
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).toggleLightById(light.id)

    expect(updatedLight.power).toBe(!light.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.provider).toBe(light.provider)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(light.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(tplinkServiceMock.setLightState).toHaveBeenCalledWith({ ...light, power: false })
    expect(lifxServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('toggle Lifx device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Brand.Lifx, power: true })
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).toggleLightById(light.id)

    expect(updatedLight.power).toBe(!light.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.provider).toBe(light.provider)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(light.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lifxServiceMock.setLightState).toHaveBeenCalledWith({ ...light, power: false })
    expect(tplinkServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('change light state in TP-Link device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Brand.TpLink })
    const config = { power: false, brightness: 50 }
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).setLightStateById(light.id, config)

    expect(updatedLight.power).toBe(config.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.provider).toBe(light.provider)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(config.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(tplinkServiceMock.setLightState).toHaveBeenCalledWith({ ...light, ...config })
    expect(lifxServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('change light state in Lifx device by id', async () => {
    const light = buildLight({ id: 'irrelevantDevice', provider: Brand.Lifx })
    const config = { power: false, brightness: 50 }
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      tplinkServiceMock,
      lifxServiceMock
    ).setLightStateById(light.id, config)

    expect(updatedLight.power).toBe(config.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.provider).toBe(light.provider)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(config.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lifxServiceMock.setLightState).toHaveBeenCalledWith({ ...light, ...config })
    expect(tplinkServiceMock.setLightState).not.toHaveBeenCalled()
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })
})
