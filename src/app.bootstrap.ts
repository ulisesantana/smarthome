import { Light, LightMongoRepository, LightRepository } from './light'
import { BrandLifxService, Brand, BrandTplinkService } from './brand'
import { inject, injectable } from 'tsyringe'

@injectable()
export class AppBootstrap {
  constructor (
      @inject(LightMongoRepository) private readonly lightRepository: LightRepository,
      @inject(BrandTplinkService) private readonly tplinkService: BrandTplinkService,
      @inject(BrandLifxService) private readonly lifxService: BrandLifxService
  ) {}

  async exec (): Promise<void> {
    const start = Date.now()
    console.info('Loading lights from Lifx provider.')
    const lifxLightsToUpdate = await this.lifxService.init(
      await this.lightRepository.getAllByProvider(Brand.Lifx)
    )

    console.info('Loading lights from TP-Link provider.')
    const tplinkLightsToUpdate = await this.tplinkService.init(
      await this.lightRepository.getAllByProvider(Brand.TpLink)
    )

    console.info('Checking lights against database.')
    const updatedLights = this.updateLights(
      [...lifxLightsToUpdate, ...tplinkLightsToUpdate]
    )
    for await (const light of updatedLights) {
      if (light.available) {
        console.info(`Found light ${light.name}.`)
      } else {
        console.info(`Light ${light.name} not found.`)
      }
    }
    console.info(`Took ${(Date.now() - start) / 1000} seconds to bootstrap Smarthome API.`)
  }

  private async * updateLights (lights: Light[]): AsyncGenerator<Light> {
    for (const light of lights) {
      const updatedLight = await this.lightRepository.update(light)
      yield updatedLight
    }
  }
}
