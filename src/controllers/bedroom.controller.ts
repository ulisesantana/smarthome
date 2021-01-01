import { MappedDevice, TplinkController } from './tplink.controller'
import { Bulb, LightState } from 'tplink-smarthome-api'

export class BedroomController {
  private readonly warmLight = 2700
  private readonly whiteLight = 6500
  private lastSelectedDevices: string[] = []
  private lastSelectedLightsConfig: Partial<LightState> = {}
  private readonly deviceNames = [
    'Puerta Terraza',
    'Esquina Estudio',
    'Puerta estudio'
  ]

  constructor (private readonly tplinkController: TplinkController) {}

  getBedroomBulbs (): Bulb[] {
    return this.deviceNames
      .map(alias => this.tplinkController.getDevice(alias) as Bulb)
      .filter(Boolean)
  }

  async toggleBedroom (): Promise<MappedDevice[]> {
    return await this.toggleScene({
      brightness: 100,
      color_temp: this.warmLight
    })
  }

  async toggleMovieScene (): Promise<MappedDevice[]> {
    return await this.toggleScene({
      brightness: 1,
      color_temp: this.warmLight
    }, this.deviceNames.filter(alias => alias === 'Puerta estudio'))
  }

  async toggleRelaxScene (): Promise<MappedDevice[]> {
    return await this.toggleScene({
      brightness: 10,
      color_temp: this.warmLight
    })
  }

  async toggleNightScene (): Promise<MappedDevice[]> {
    return await this.toggleScene({
      brightness: 50,
      color_temp: this.warmLight
    })
  }

  async toggleDayScene (): Promise<MappedDevice[]> {
    return await this.toggleScene({
      brightness: 100,
      color_temp: this.whiteLight
    })
  }

  async isBedroomOn (): Promise<boolean> {
    const bulbStates = await Promise.all(
      this.getBedroomBulbs()
        .map(async (bulb) => await bulb.lighting.getLightState())
    )
    return bulbStates.some(bulb => bulb.on_off)
  }

  private async toggleScene (lightsConfig: LightState, bulbNames = this.deviceNames): Promise<MappedDevice[]> {
    const bulbs = this.getBedroomBulbs()
    const isBedroomOn = await this.isBedroomOn()

    if (isBedroomOn && this.areBulbsAlreadyOn(bulbNames) && this.areLightsConfigAlreadyInUse(lightsConfig)) {
      await Promise.all(bulbs.map(async (bulb) => await bulb.setPowerState(false)))
    } else {
      await Promise.all(bulbs.map(async (bulb) => {
        if (bulbNames.includes(bulb.alias)) {
          await bulb.lighting.setLightState({
            ...lightsConfig,
            on_off: 1
          })
        } else {
          await bulb.setPowerState(false)
        }
      }))
    }

    this.lastSelectedDevices = bulbNames
    this.lastSelectedLightsConfig = lightsConfig

    return await this.tplinkController.devices
  }

  private areLightsConfigAlreadyInUse (lightsConfig: Partial<LightState>): boolean {
    return JSON.stringify(lightsConfig) === JSON.stringify(this.lastSelectedLightsConfig)
  }

  private areBulbsAlreadyOn (bulbNames: string[]): boolean {
    return JSON.stringify(bulbNames) === JSON.stringify(this.lastSelectedDevices)
  }
}
