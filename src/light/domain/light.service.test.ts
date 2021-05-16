import { buildLight } from '../../common/test'
import { LightService } from './light.service'
import { Light } from './light.model'
import { Brand, BrandService } from '../../brand'
import { LightRepository } from './light.repository'
import { container } from 'tsyringe'
import { LightMongoRepository } from '../infrastructure/light.mongo.repository'
import { Lights } from './lights.model'

type MockRepositoriesParams = Partial<{
  getById: Light,
  getAll: Lights,
}>

describe('Light service should', () => {
  let lightRepositoryMock: LightRepository
  let brandServiceMock: BrandService
  let mockRepositories: Function

  beforeEach(() => {
    container.clearInstances()
    lightRepositoryMock = container.resolve(LightMongoRepository)
    brandServiceMock = container.resolve(BrandService)
    brandServiceMock.setLightState = jest.fn()
    container.registerInstance(BrandService, brandServiceMock)

    mockRepositories = ({
      getById,
      getAll
    }: MockRepositoriesParams) => {
      lightRepositoryMock.getById = jest.fn(async () => getById || {} as Light)
      lightRepositoryMock.getAll = jest.fn(async () => getAll || new Lights())
      lightRepositoryMock.update = jest.fn(async (light: Light) => light)
    }
  })
  it('get all devices from database', async () => {
    const mockedLights = Array(2).map(() => buildLight())
    mockRepositories({ getAll: mockedLights })

    const lights = await new LightService(
      lightRepositoryMock,
      brandServiceMock
    ).getLights()

    expect(lights).toHaveLength(mockedLights.length)
  })

  it('toggle TP-Link device by id', async () => {
    const light = buildLight({
      id: 'irrelevantDevice',
      brand: Brand.TpLink,
      power: true
    })
    mockRepositories({ getById: new Light(light) })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      brandServiceMock
    ).toggleLightById(light.id)

    expect(updatedLight.power).toBe(!light.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.brand).toBe(light.brand)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(light.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('toggle Lifx device by id', async () => {
    const light = buildLight({
      id: 'irrelevantDevice',
      brand: Brand.Lifx,
      power: true
    })
    mockRepositories({ getById: new Light(light) })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      brandServiceMock
    ).toggleLightById(light.id)

    expect(updatedLight.power).toBe(!light.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.brand).toBe(light.brand)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(light.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('change light state in TP-Link device by id', async () => {
    const light = buildLight({
      id: 'irrelevantDevice',
      brand: Brand.TpLink
    })
    const config = {
      power: false,
      brightness: 50
    }
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      brandServiceMock
    ).setLightStateById(light.id, config)

    expect(updatedLight.power).toBe(config.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.brand).toBe(light.brand)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(config.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })

  it('change light state in Lifx device by id', async () => {
    const light = buildLight({
      id: 'irrelevantDevice',
      brand: Brand.Lifx
    })
    const config = {
      power: false,
      brightness: 50
    }
    mockRepositories({ getById: light })

    const updatedLight = await new LightService(
      lightRepositoryMock,
      brandServiceMock
    ).setLightStateById(light.id, config)

    expect(updatedLight.power).toBe(config.power)
    expect(updatedLight.id).toBe(light.id)
    expect(updatedLight.brand).toBe(light.brand)
    expect(updatedLight.available).toBe(light.available)
    expect(updatedLight.brightness).toBe(config.brightness)
    expect(updatedLight.colorTemp).toBe(light.colorTemp)
    expect(updatedLight.name).toBe(light.name)
    expect(updatedLight.type).toBe(light.type)
    expect(lightRepositoryMock.getById).toHaveBeenCalled()
  })
})
