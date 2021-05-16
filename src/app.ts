import { Light, lightRoutes, Lights, LightService } from './light'
import { BrandService } from './brand'
import { inject, injectable } from 'tsyringe'
import { FastifyInstance } from 'fastify'
import { roomRoutes } from './room'
import { sceneRoutes } from './scene'

@injectable()
export class App {
  constructor (
      @inject(LightService) private readonly lightService: LightService,
      @inject(BrandService) private readonly brandService: BrandService
  ) {}

  async start (server: FastifyInstance) {
    await this.bootstrap()
    App.addRoutes(server)
  }

  private static addRoutes (server: FastifyInstance): void {
    lightRoutes(server)
    roomRoutes(server)
    sceneRoutes(server)
  }

  private async bootstrap (): Promise<void> {
    const start = Date.now()
    console.info('Loading lights.')
    const lightsToUpdate = await this.brandService.init(
      await this.lightService.getLights()
    )

    console.info('Checking lights against database.')
    const updatedLights = this.updateLights(lightsToUpdate)
    for await (const light of updatedLights) {
      if (light.available) {
        console.info(`Found light ${light.name} from ${light.brand} brand.`)
      } else {
        console.info(`Light ${light.name} from ${light.brand} brand not found.`)
      }
    }
    console.info(`Took ${(Date.now() - start) / 1000} seconds to bootstrap Smarthome API.`)
  }

  private async * updateLights (lights: Lights): AsyncGenerator<Light> {
    for (const light of lights.getAll()) {
      const updatedLight = await this.lightService.saveLight(light)
      yield updatedLight
    }
  }
}
