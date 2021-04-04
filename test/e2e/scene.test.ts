import { Scene, SceneRepository } from '../../src/scene'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { AppBootstrap } from '../../src/app.bootstrap'
import { buildLight, buildScene } from '../../src/common/test'
import { Light, LightRepository } from '../../src/light'
import { LifxRepository } from '../../src/provider'

const appBootstrap = container.resolve(AppBootstrap)
appBootstrap.exec = async () => {}
container.registerInstance(AppBootstrap, appBootstrap)

describe('scene endpoints', () => {
  describe('/scene', () => {
    describe('GET should', () => {
      it('retrieve all scenes in database', async () => {
        const server = await buildServer()
        await setSceneCollection([
          buildScene(),
          buildScene(),
          buildScene(),
          buildScene()
        ])

        const response = await server.inject({
          url: '/scene',
          method: 'GET'
        })
        await server.close()

        const scenes = response.json()
        expect(response.statusCode).toBe(200)
        expect(scenes).toHaveLength(4)
      })
      it('retrieve an empty array if there is no scenes in database', async () => {
        const server = await buildServer()
        await setSceneCollection([])

        const response = await server.inject({
          url: '/scene',
          method: 'GET'
        })
        await server.close()

        const scenes = response.json()
        expect(response.statusCode).toBe(200)
        expect(scenes).toHaveLength(0)
      })
    })
    describe('POST should', () => {
      it('create a new scene', async () => {
        const server = await buildServer()
        const scene = buildScene()
        await setSceneCollection([])
        await setLightCollection(scene.lights)

        const response = await server.inject({
          url: '/scene',
          method: 'POST',
          payload: { ...scene, lights: scene.lights.map(({ id }) => id) }
        })
        await server.close()

        const createdScene = response.json()
        expect(response.statusCode).toBe(200)
        expect(createdScene.name).toBe(scene.name)
        expect(createdScene.color).toBe(scene.color)
        expect(createdScene.icon).toBe(scene.icon)
        expect(createdScene.lights).toStrictEqual(scene.lights)
      })
    })
  })

  describe('/scene/:id', () => {
    describe('GET should', () => {
      it('retrieve the scene based on the id', async () => {
        const server = await buildServer()
        const scene = buildScene()
        await setSceneCollection([scene])
        await setLightCollection(scene.lights)

        const response = await server.inject({
          url: `/scene/${scene.id}`,
          method: 'GET'
        })
        await server.close()

        const retrievedScene = response.json()
        expect(response.statusCode).toBe(200)
        expect(retrievedScene).toStrictEqual(scene)
      })
      it('retrieve 404 if there is no scene with the given id in database', async () => {
        const server = await buildServer()
        await setSceneCollection([])

        const response = await server.inject({
          url: '/scene/irrelevantId',
          method: 'GET'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
    describe('PATCH should', () => {
      it('update the scene status', async () => {
        const server = await buildServer()
        const lifxRepository = container.resolve(LifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(LifxRepository, lifxRepository)
        const scene = buildScene({ name: 'Bedscene', color: 'red' })
        await setSceneCollection([scene])
        const update = {
          name: 'Movie',
          color: 'rebeccapurple',
          icon: 'theater',
          brightness: 25,
          colorTemp: 2700
        }

        const response = await server.inject({
          url: `scene/${scene.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        const updatedScene = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedScene).toStrictEqual({ ...scene, ...update })
      })
      it('update the scene lights', async () => {
        const server = await buildServer()
        const lifxRepository = container.resolve(LifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(LifxRepository, lifxRepository)
        const scene = buildScene({ lights: [buildLight(), buildLight()] })
        const newLights = [...scene.lights, buildLight()]
        await setSceneCollection([scene])
        await setLightCollection(newLights)
        const update = { lights: newLights.map(({ id }) => id) }

        const response = await server.inject({
          url: `scene/${scene.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        const updatedScene = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedScene).toStrictEqual({ ...scene, lights: newLights })
      })
      it('return 404 if the scene is not in database', async () => {
        const server = await buildServer()
        const lifxRepository = container.resolve(LifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(LifxRepository, lifxRepository)
        const scene = buildScene()
        await setSceneCollection([])
        const update = { name: 'Kitchen', color: 'black', icon: 'kitchen' }

        const response = await server.inject({
          url: `scene/${scene.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
    describe('DELETE should', () => {
      it('delete the scene based on the id', async () => {
        const server = await buildServer()
        const scene = buildScene()
        await setSceneCollection([scene])

        const response = await server.inject({
          url: `/scene/${scene.id}`,
          method: 'DELETE'
        })
        await server.close()

        expect(response.statusCode).toBe(204)
        const scenes = await container.resolve(MongoDB)
          .useCollection(SceneRepository.collection)
          .find({})
        expect(scenes).toHaveLength(0)
      })
      it('retrieve 404 if there is no scene with the given id in database', async () => {
        const server = await buildServer()
        await setSceneCollection([])

        const response = await server.inject({
          url: '/scene/irrelevantId',
          method: 'DELETE'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('/scene/:id/toggle', () => {
    describe('PATCH should', () => {
      it('toggle the scene lights power', async () => {
        const server = await buildServer()
        const lifxRepository = container.resolve(LifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(LifxRepository, lifxRepository)
        const scene = buildScene({ lights: [buildLight()] })
        await setSceneCollection([scene])

        const response = await server.inject({
          url: `scene/${scene.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        const updatedScene = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedScene).toStrictEqual({
          ...scene,
          lights: scene.lights.map(light => ({
            ...light,
            brightness: scene.brightness,
            colorTemp: scene.colorTemp,
            power: !light.power
          }))
        })
      })
      it('return 404 if the scene is not in database', async () => {
        const server = await buildServer()
        const lifxRepository = container.resolve(LifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(LifxRepository, lifxRepository)
        const scene = buildScene()
        await setSceneCollection([])

        const response = await server.inject({
          url: `scene/${scene.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })
})

async function setSceneCollection (scenes: Scene[]): Promise<void> {
  await container.resolve(MongoDB).useCollection(SceneRepository.collection).removeCollection()
  await container.resolve(MongoDB).useCollection(LightRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _scene of generateScenes(scenes)) {}
}

async function * generateScenes (scenes: Scene[]) {
  const sceneRepository = container.resolve(SceneRepository)
  for (const scene of scenes) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
    for await (const _light of generateLights(scene.lights)) {}
    await sceneRepository.update({
      ...scene,
      lights: scene.lights.map(({ id }) => id)
    })
    yield scene
  }
}

async function setLightCollection (lights: Light[]): Promise<void> {
  await container.resolve(MongoDB).useCollection(LightRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _light of generateLights(lights)) {}
}

async function * generateLights (lights: Light[]) {
  const lightRepository = container.resolve(LightRepository)
  for (const light of lights) {
    await lightRepository.upsert(light)
    yield light
  }
}
