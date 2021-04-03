import { Light, LightRepository } from '../../src/light'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { AppBootstrap } from '../../src/app.bootstrap'
import { buildLight } from '../../src/common/test'

const appBootstrap = container.resolve(AppBootstrap)
appBootstrap.exec = async () => {}
container.registerInstance(AppBootstrap, appBootstrap)

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

      const lights = response.json()
      expect(response.statusCode).toBe(200)
      expect(lights).toHaveLength(4)
      await server.close()
    })
  })
})

async function setLightCollection (lights: Light[]): Promise<void> {
  await container.resolve(MongoDB)
    .useCollection(LightRepository.collection)
    .removeCollection()
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
