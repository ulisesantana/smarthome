import { LightState } from 'tplink-smarthome-api'
import { LifxService, TplinkService } from '../services'
import { Device, LightConfig } from '../domain'

export class OfficeController {
  private readonly warmLight = 2700
  private readonly whiteLight = 6500
  private lastSelectedDevices: string[] = []
  private lastSelectedLightsConfig: Partial<LightState> = {}
  private readonly plug = 'Lampara estudio'
  private readonly bulbs = [
    'Lámpara Izquierda',
    'Lámpara Derecha',
    'Entrada Escalera'
  ]

  constructor (private readonly tplinkService: TplinkService, private readonly lifxService: LifxService) {}

  async toggleOffice (): Promise<Device[]> {
    return (await Promise.all([
      this.togglePlug(),
      this.toggleBulbs()
    ])).flat()
  }

  async toggleMovieScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 5,
      colorTemp: this.warmLight
    }, ['Lámpara Izquierda', 'Lámpara Derecha'])
  }

  async toggleRelaxScene (): Promise<Device[]> {
    return await this.toggleScene({
      brightness: 10,
      colorTemp: this.warmLight
    }, ['Lámpara Izquierda', 'Lámpara Derecha'])
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

  private async isOfficeOn (): Promise<boolean> {
    const bulbs = await this.getOfficeLights()
    return bulbs.some(bulb => bulb.power)
  }

  private async getOfficeLights (): Promise<Device[]> {
    return (await Promise.all([
      this.tplinkService.getDeviceByName(this.plug),
      Promise.all(this.bulbs.map(this.lifxService.getDeviceByName.bind(this.lifxService)))
    ])).flat()
  }

  private async togglePlug (): Promise<Device[]> {
    return await this.tplinkService.toggleDeviceByName(this.plug)
  }

  private async toggleBulbs (): Promise<Device[]> {
    const bulbUpdates = await Promise.all(this.bulbs.map(async name => {
      const bulb = await this.lifxService.getDeviceByName(name)
      return await this.lifxService.setLightState({
        ...bulb,
        power: !bulb.power,
        brightness: 100,
        colorTemp: this.warmLight
      })
    }))
    return bulbUpdates[bulbUpdates.length - 1]
  }

  private async toggleScene (lightsConfig: LightConfig, bulbNames = [...this.bulbs, this.plug]): Promise<Device[]> {
    const lights = await this.getOfficeLights()
    console.log('')
    const isOfficeOn = await this.isOfficeOn()

    if (isOfficeOn && this.areBulbsAlreadyOn(bulbNames) && this.isLightsConfigAlreadyInUse(lightsConfig)) {
      await Promise.all(lights.map(async (light) => {
        light.name === this.plug
          ? await this.tplinkService.setLightState({ ...light, power: false })
          : await this.lifxService.setLightState({ ...light, power: false })
      }))
    } else {
      await Promise.all(lights.map(async (light) => {
        if (bulbNames.includes(light.name)) {
          light.name === this.plug
            ? await this.tplinkService.setLightState({ ...light, power: true })
            : await this.lifxService.setLightState({ ...light, ...lightsConfig, power: true })
        } else {
          light.name === this.plug
            ? await this.tplinkService.setLightState({ ...light, power: false })
            : await this.lifxService.setLightState({ ...light, power: false })
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
