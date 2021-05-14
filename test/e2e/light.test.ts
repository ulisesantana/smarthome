import { Light, LightMongoRepository, lightRoutes } from '../../src/light'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { App } from '../../src/app'
import { buildLight } from '../../src/common/test'
import { Brand, BrandLifxRepository } from '../../src/brand'

const app = container.resolve(App)
app.start = async (server) => { lightRoutes(server) }
container.registerInstance(App, app)

describe('light endpoints', () => {
  describe('/light', () => {
    describe('GET should', () => {
      it('retrieve all lights in database', async () => {
        const server = await buildServer()
        await setLightCollection([
          buildLight(),
          buildLight(),
          buildLight(),
          buildLight()
        ])

        const response = await server.inject({
          url: '/light',
          method: 'GET'
        })
        await server.close()

        const lights = response.json()
        expect(response.statusCode).toBe(200)
        expect(lights).toHaveLength(4)
      })
      it('retrieve an empty array if there is no lights in database', async () => {
        const server = await buildServer()
        await setLightCollection([])

        const response = await server.inject({
          url: '/light',
          method: 'GET'
        })
        await server.close()

        const lights = response.json()
        expect(response.statusCode).toBe(200)
        expect(lights).toHaveLength(0)
      })
    })
  })

  describe('/light/:id', () => {
    describe('PATCH should', () => {
      it('update the light status', async () => {
        const lifxRepository = container.resolve(BrandLifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(BrandLifxRepository, lifxRepository)
        const server = await buildServer()
        const light = buildLight()
        await setLightCollection([light])
        const update = { brightness: 25, colorTemp: 5000 }

        const response = await server.inject({
          url: `light/${light.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        const updatedLight = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedLight).toStrictEqual({ ...light, ...update })
      })
      it('return 404 if the light is not in database', async () => {
        const server = await buildServer()
        const light = buildLight()
        await setLightCollection([])
        const update = { brightness: 25, colorTemp: 5000 }

        const response = await server.inject({
          url: `light/${light.id}`,
          method: 'patch',
          payload: update
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('/light/:id/toggle', () => {
    describe('PATCH should', () => {
      it('toggle the light power', async () => {
        const lifxRepository = container.resolve(BrandLifxRepository)
        lifxRepository.setState = jest.fn()
        container.registerInstance(BrandLifxRepository, lifxRepository)
        const server = await buildServer()
        const light = buildLight({ provider: Brand.TpLink })
        await setLightCollection([light])

        const response = await server.inject({
          url: `light/${light.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        const updatedLight = response.json()
        expect(response.statusCode).toBe(200)
        expect(updatedLight).toStrictEqual({ ...light, power: !light.power })
      })
      it('return 404 if the light is not in database', async () => {
        const server = await buildServer()
        const light = buildLight()
        await setLightCollection([])

        const response = await server.inject({
          url: `light/${light.id}/toggle`,
          method: 'patch'
        })
        await server.close()

        expect(response.statusCode).toBe(404)
      })
    })
  })
})

async function setLightCollection (lights: Light[]): Promise<void> {
  await container.resolve(MongoDB).useCollection(LightMongoRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _light of generateLights(lights)) {}
}

async function * generateLights (lights: Light[]) {
  const lightRepository = container.resolve(LightMongoRepository)
  for (const light of lights) {
    await lightRepository.update(light)
    yield light
  }
}
