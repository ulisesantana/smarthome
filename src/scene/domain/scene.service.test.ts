import { SceneService } from './scene.service'
import { buildSceneEntity, buildScene, buildLight } from '../../common/test'
import { SceneRepository } from '../infrastructure/scene.repository'
import { LightService } from '../../light'
import { container } from 'tsyringe'
import { Scene, SceneEntity, SceneRequest } from './scene.model'

type MockRepositoriesParams = Partial<{
    getById: Scene,
    getAll: Scene[],
    update: SceneEntity
}>

describe('Scene service should', () => {
  let sceneRepository: SceneRepository
  let lightService: LightService
  let mockRepository: Function

  beforeEach(() => {
    container.clearInstances()
    sceneRepository = container.resolve(SceneRepository)
    lightService = container.resolve(LightService)
    lightService.setLightStateById = jest.fn()
    sceneRepository.create = jest.fn()
    sceneRepository.remove = jest.fn()

    mockRepository = ({
      getById, getAll, update
    }: MockRepositoriesParams) => {
      sceneRepository.getById = jest.fn(async () => getById || {} as Scene)
      sceneRepository.getAll = jest.fn(async () => getAll || [] as Scene[])
      sceneRepository.update = jest.fn(async () => update || {} as SceneEntity)
    }
  })
  describe('create a new scene', () => {
    it('with given values', async () => {
      const mockId = 'noId'
      const light = buildLight()
      const mockScene = buildSceneEntity({ id: mockId, lights: [light.id] })
      const expectedScene = buildScene({ ...mockScene, lights: [light] })
      lightService.getLightsById = jest.fn(async () => [expectedScene.lights[0]])

      const createdScene = await new SceneService(lightService, sceneRepository).create(mockScene)

      expect(createdScene.color).toBe(expectedScene.color)
      expect(createdScene.icon).toBe(expectedScene.icon)
      expect(createdScene.name).toBe(expectedScene.name)
      expect(createdScene.brightness).toBe(expectedScene.brightness)
      expect(createdScene.colorTemp).toBe(expectedScene.colorTemp)
      expect(createdScene.lights).toStrictEqual(expectedScene.lights)
      expect(sceneRepository.create).toHaveBeenCalled()
    })

    it('filled with default values if no values are given', async () => {
      lightService.getLightsById = jest.fn(async () => [])
      const defaultSceneValues: SceneRequest = {
        color: 'orangered',
        lights: [],
        icon: 'wb_sunny',
        name: 'NO NAME',
        brightness: 50,
        colorTemp: 3200
      }

      const createdScene = await new SceneService(lightService, sceneRepository).create()

      expect(createdScene.color).toBe(defaultSceneValues.color)
      expect(createdScene.icon).toBe(defaultSceneValues.icon)
      expect(createdScene.name).toBe(defaultSceneValues.name)
      expect(createdScene.brightness).toBe(defaultSceneValues.brightness)
      expect(createdScene.colorTemp).toBe(defaultSceneValues.colorTemp)
      expect(createdScene.lights).toStrictEqual(defaultSceneValues.lights)
    })
  })

  it('retrieve all scenes in database', async () => {
    const mockedScenes = [buildScene(), buildScene(), buildScene()]
    mockRepository({ getAll: mockedScenes })

    const scenesInDb = await new SceneService(lightService, sceneRepository).getAll()

    expect(scenesInDb).toStrictEqual(mockedScenes)
  })

  it('retrieve scene by id', async () => {
    const mockedScene = buildScene()
    mockRepository({ getById: mockedScene })

    const scene = await new SceneService(lightService, sceneRepository).getById(mockedScene.id)

    expect(scene).toStrictEqual(mockedScene)
    expect(sceneRepository.getById).toBeCalledWith(mockedScene.id)
  })

  it('update a scene and return it', async () => {
    const mockedScene = buildScene({ brightness: 100, colorTemp: 5000 })
    const updates = { color: 'red', brightness: 10, colorTemp: 2700 }
    const updatedScene = { ...mockedScene, ...updates }
    lightService.getLightsById = async () => mockedScene.lights
    mockRepository({
      getById: mockedScene,
      update: { ...updatedScene, lights: updatedScene.lights.map(({ id }) => id) }
    })

    const scene = await new SceneService(lightService, sceneRepository).update(mockedScene.id, updates)

    expect(scene).toStrictEqual(updatedScene)
    expect(sceneRepository.getById).toBeCalledWith(mockedScene.id)
    expect(sceneRepository.update).toBeCalledWith({ id: mockedScene.id, ...updates })
  })

  it('remove scene', async () => {
    const mockedScene = buildScene()
    mockRepository({ getById: mockedScene })

    await new SceneService(lightService, sceneRepository).remove(mockedScene.id)

    expect(sceneRepository.remove).toBeCalledWith(mockedScene.id)
  })

  describe('toggle scene devices and apply scene config by scene id', () => {
    it('if any device is powered on then all will be powered on', async () => {
      const mockedScene = buildScene({
        lights: [
          buildLight({ power: true }),
          buildLight({ power: false }),
          buildLight({ power: false })
        ]
      })
      const toggledScene: Scene = {
        ...mockedScene,
        lights: mockedScene.lights.map(light => ({
          ...light,
          power: false,
          brightness: mockedScene.brightness,
          colorTemp: mockedScene.colorTemp
        }))
      }
      mockRepository({ getById: { ...mockedScene } })

      const scene = await new SceneService(lightService, sceneRepository).toggleLightsBySceneId(mockedScene.id)

      expect(scene).toStrictEqual(toggledScene)
      expect(lightService.setLightStateById).toHaveBeenCalledTimes(3)
    })
    it('if all devices are powered off then all will be powered on', async () => {
      const mockedScene = buildScene({
        lights: [
          buildLight({ power: false }),
          buildLight({ power: false }),
          buildLight({ power: false })
        ]
      })
      const toggledScene: Scene = {
        ...mockedScene,
        lights: mockedScene.lights.map(light => ({
          ...light,
          power: true,
          brightness: mockedScene.brightness,
          colorTemp: mockedScene.colorTemp
        }))
      }
      mockRepository({ getById: { ...mockedScene } })

      const scene = await new SceneService(lightService, sceneRepository).toggleLightsBySceneId(mockedScene.id)

      expect(scene).toStrictEqual(toggledScene)
      expect(lightService.setLightStateById).toHaveBeenCalledTimes(3)
    })
    it('if all devices are powered on then all will be powered off', async () => {
      const mockedScene = buildScene({
        lights: [
          buildLight({ power: true }),
          buildLight({ power: true }),
          buildLight({ power: true })
        ]
      })
      const toggledScene: Scene = {
        ...mockedScene,
        lights: mockedScene.lights.map(light => ({
          ...light,
          power: false,
          brightness: mockedScene.brightness,
          colorTemp: mockedScene.colorTemp
        }))
      }
      mockRepository({ getById: { ...mockedScene } })

      const scene = await new SceneService(lightService, sceneRepository).toggleLightsBySceneId(mockedScene.id)

      expect(scene).toStrictEqual(toggledScene)
      expect(lightService.setLightStateById).toHaveBeenCalledTimes(3)
    })
  })
})
