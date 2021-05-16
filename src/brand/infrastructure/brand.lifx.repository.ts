/* eslint-disable camelcase */
import { Light, Lights, LightType } from '../../light'
import { Environment, http } from '../../common'
import { Brand } from '../domain/brand.service'
import { inject, injectable } from 'tsyringe'
import { BrandRepository } from '../domain/brand.repository'

export interface LifxLight {
  id: string
  label: string
  power: string
  color: { hue: number, saturation: number, kelvin: number }
  brightness: number
}

interface StateOptions {
  power?: 'on' | 'off'
  color?: string
  brightness?: number // between 0 and 1
  duration?: number
  infrared?: number
  fast?: boolean
}

@injectable()
export class BrandLifxRepository implements BrandRepository {
  private readonly url = 'https://api.lifx.com/v1/lights'
  private readonly token: string

  // TODO: Inject http for mocking and testing
  constructor (@inject(Environment) private readonly environment: Environment) {
    this.token = environment.getVariables().lifxToken
    if (this.environment.isProduction()) {
      if (!this.token) {
        console.error('Missing Lifx token. Exiting application.')
        process.exit(1)
      }
    }
  }

  async getAllLights (): Promise<Lights> {
    const response = await http.get(`${this.url}/all`, {
      auth: {
        bearer: this.token
      }
    })
    const lights = response.toJSON().body
    return new Lights(lights.map(BrandLifxRepository.mapToDomain))
  }

  async setState (light: Light): Promise<void> {
    const options = BrandLifxRepository.mapToProvider(light)
    const body: StateOptions = {
      fast: true
    }
    if (options.power !== undefined) {
      body.power = options.power
    }
    if (options.color !== undefined) {
      body.color = options.color
    }
    if (options.brightness !== undefined) {
      body.brightness = options.brightness
    }
    if (options.duration !== undefined) {
      body.duration = options.duration
    }
    if (options.infrared !== undefined) {
      body.infrared = options.infrared
    }
    if (options.fast !== undefined) {
      body.fast = options.fast
    }

    const response = await http.put(`${this.url}/id:${light.id}/state`, {
      auth: {
        bearer: this.token
      },
      body
    })

    console.debug(`Lifx set state for ${light.name}`, response.toJSON().body)
    console.debug(body)
    console.debug(`Response ${light.name}`, response.statusMessage)
  }

  private static mapToProvider (light: Light): StateOptions {
    return {
      power: light.power ? 'on' : 'off',
      color: `kelvin:${light.colorTemp}`,
      brightness: light.brightness / 100
    }
  }

  private static mapToDomain (light: LifxLight): Light {
    return new Light({
      id: light.id,
      name: light.label.trim(),
      type: LightType.Bulb,
      brightness: light.brightness * 100,
      colorTemp: light.color.kelvin,
      power: light.power === 'on',
      available: true,
      brand: Brand.Lifx
    })
  }
}
