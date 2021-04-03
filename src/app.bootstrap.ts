import { Light, LightRepository } from './light'
import { LifxService, Provider, TplinkService } from './provider'
import { inject, injectable } from 'tsyringe'

@injectable()
export class AppBootstrap {
  constructor (
      @inject(LightRepository) private readonly lightRepository: LightRepository,
      @inject(TplinkService) private readonly tplinkService: TplinkService,
      @inject(LifxService) private readonly lifxService: LifxService
  ) {}

  async exec (): Promise<void> {
    const start = Date.now()
    console.info('Loading lights from Lifx provider.')
    const lifxLightsToUpdate = await this.lifxService.init(
      await this.lightRepository.findAllByProvider(Provider.Lifx)
    )

    console.info('Loading lights from TP-Link provider.')
    const tplinkLightsToUpdate = await this.tplinkService.init(
      await this.lightRepository.findAllByProvider(Provider.TpLink)
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
      const updatedLight = await this.lightRepository.upsert(light)
      yield updatedLight
    }
  }
}
