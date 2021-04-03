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
    const lifxLightsToUpdate = await this.lifxService.init(
      await this.lightRepository.findAllByProvider(Provider.Lifx)
    )

    const tplinkLightsToUpdate = await this.tplinkService.init(
      await this.lightRepository.findAllByProvider(Provider.TpLink)
    )

    const updatedLights = this.updateLights(
      [...lifxLightsToUpdate, ...tplinkLightsToUpdate]
    )
    for await (const device of updatedLights) {
      if (device.available) {
        console.debug(`Found light ${device.name}`)
      } else {
        console.debug(`Light ${device.name} not found.`)
      }
    }
  }

  private async * updateLights (lights: Light[]): AsyncGenerator<Light> {
    for (const light of lights) {
      const updatedLight = await this.lightRepository.upsert(light)
      yield updatedLight
    }
  }
}
