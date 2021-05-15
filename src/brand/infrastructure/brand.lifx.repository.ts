/* eslint-disable camelcase */
import { Light, LightType } from '../../light'
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

  async getAllLights (): Promise<Light[]> {
    const response = await http.get(`${this.url}/all`, {
      auth: {
        bearer: this.token
      }
    })
    const lights = response.toJSON().body
    return lights.map(BrandLifxRepository.mapToDomain)
  }

  async setState (device: Light): Promise<void> {
    const options = BrandLifxRepository.mapToProvider(device)
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

    const response = await http.put(`${this.url}/id:${device.id}/state`, {
      auth: {
        bearer: this.token
      },
      body
    })

    console.debug(`Lifx set state for ${device.name}`, response.toJSON().body)
    console.debug(body)
    console.debug(`Response ${device.name}`, response.statusMessage)
  }

  private static mapToProvider (device: Light): StateOptions {
    return {
      power: device.power ? 'on' : 'off',
      color: `kelvin:${device.colorTemp}`,
      brightness: device.brightness / 100
    }
  }

  private static mapToDomain (device: LifxLight): Light {
    return ({
      id: device.id,
      name: device.label.trim(),
      type: LightType.Bulb,
      brightness: device.brightness * 100,
      colorTemp: device.color.kelvin,
      power: device.power === 'on',
      available: true,
      brand: Brand.Lifx
    })
  }
}
