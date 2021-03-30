/* eslint-disable camelcase */
import { Device, DeviceType } from '../../../domain'
import { http, Provider, ProviderRepository } from '../../../common'

export interface LifxLight {
  id: string
  uuid: string
  label: string
  connected: boolean
  power: string
  color: { hue: number, saturation: number, kelvin: number }
  brightness: number
  group: { id: string, name: string }
  location: { id: string, name: string }
  product: {
    name: string
    identifier: string
    company: string
    vendor_id: number
    product_id: number
    capabilities: {
      has_color: boolean
      has_variable_color_temp: boolean
      has_ir: boolean
      has_hev: boolean
      has_chain: boolean
      has_matrix: boolean
      has_multizone: boolean
      min_kelvin: number
      max_kelvin: number
    }
  }
  last_seen: string
  seconds_since_seen: number
}

interface StateOptions {
  power?: 'on' | 'off'
  color?: string
  brightness?: number // between 0 and 1
  duration?: number
  infrared?: number
  fast?: boolean
}

export class LifxRepository implements ProviderRepository {
  private readonly url = 'https://api.lifx.com/v1/lights'
  constructor (private readonly token: string) {
    if (token === '') {
      console.error('Missing Lifx token. Exiting application.')
      process.exit(1)
    }
  }

  async getAllDevices (): Promise<Device[]> {
    const response = await http.get(`${this.url}/all`, {
      auth: {
        bearer: this.token
      }
    })
    const lights = response.toJSON().body
    return lights.map(LifxRepository.mapToDomain)
  }

  async setState (device: Device): Promise<void> {
    const options = LifxRepository.mapToProvider(device)
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

  private static mapToProvider (device: Device): StateOptions {
    return {
      power: device.power ? 'on' : 'off',
      color: `kelvin:${device.colorTemp}`,
      brightness: device.brightness / 100
    }
  }

  private static mapToDomain (device: LifxLight): Device {
    return ({
      id: device.id,
      name: device.label.trim(),
      type: DeviceType.Bulb,
      brightness: device.brightness * 100,
      colorTemp: device.color.kelvin,
      power: device.power === 'on',
      available: true,
      provider: Provider.Lifx
    })
  }
}
