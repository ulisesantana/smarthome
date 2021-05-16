import { LightMongoRepository, Lights } from '../../src/light'
import { container } from 'tsyringe'
import { MongoDB } from '../../src/common'
import { generateLights } from './index'

export async function setLightCollection (lights: Lights): Promise<void> {
  await container.resolve(MongoDB).useCollection(LightMongoRepository.collection).removeCollection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
  for await (const _light of generateLights(lights)) {
  }
}
