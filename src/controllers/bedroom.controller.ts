import { Device, LightConfig } from '../domain'
import { TplinkService } from '../services'

export class BedroomController {
  private readonly warmLight = 2700
  private readonly whiteLight = 6500
  private lastSelectedDevices: string[] = []
  private lastSelectedLightsConfig: LightConfig = {
    colorTemp: this.warmLight,
    brightness: 0
  }

  private readonly deviceNames = [
    'Puerta Terraza',
    'Esquina Dormitorio',
    'Puerta Dormitorio'
  ]

  constructor (private readonly tplinkService: TplinkService) {}

  async getBedroomBulbs (): Promise<Device[]> {
    return (await Promise.all(
      this.deviceNames.map(async (alias) =>
        await this.tplinkService.getDeviceByName(alias)
      ))
    ).filter(Boolean)
  }

  async toggleBedroom (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 100,
      colorTemp: this.warmLight
    })
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 10,
      colorTemp: this.warmLight
    }, ['Puerta Dormitorio'])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 10,
      colorTemp: this.warmLight
    })
  }

  async toggleNightScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 50,
      colorTemp: this.warmLight
    })
  }

  async toggleDayScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 100,
      colorTemp: this.whiteLight
    })
  }

  async isBedroomOn (): Promise<boolean> {
    const bulbs = await this.getBedroomBulbs()
    return bulbs.some(bulb => bulb.power)
  }

  private async toggleScene (lightsConfig: LightConfig, bulbNames = this.deviceNames): Promise<Device[]> {
    const bulbs = await this.getBedroomBulbs()
    const isBedroomOn = await this.isBedroomOn()

    if (isBedroomOn && this.areBulbsAlreadyOn(bulbNames) && this.isLightsConfigAlreadyInUse(lightsConfig)) {
      await Promise.all(bulbs.map(async (bulb) => await this.tplinkService.setLightState({ ...bulb, power: false })))
    } else {
      await Promise.all(bulbs.map(async (bulb) => {
        if (bulbNames.includes(bulb.name)) {
          await this.tplinkService.setLightState({ ...bulb, ...lightsConfig, power: true })
        } else {
          await this.tplinkService.setLightState({ ...bulb, power: false })
        }
      }))
    }

    this.lastSelectedDevices = bulbNames
    this.lastSelectedLightsConfig = lightsConfig

    return await this.tplinkService.getDevices()
  }

  private isLightsConfigAlreadyInUse (lightsConfig: LightConfig): boolean {
    return JSON.stringify(lightsConfig) === JSON.stringify(this.lastSelectedLightsConfig)
  }

  private areBulbsAlreadyOn (bulbNames: string[]): boolean {
    return JSON.stringify(bulbNames) === JSON.stringify(this.lastSelectedDevices)
  }
}
