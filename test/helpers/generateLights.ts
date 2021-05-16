import { LightMongoRepository, Lights } from '../../src/light'
import { container } from 'tsyringe'

export async function * generateLights (lights: Lights) {
  const lightRepository = container.resolve(LightMongoRepository)
  for (const light of lights.getAll()) {
    await lightRepository.update(light)
    yield light
  }
}
