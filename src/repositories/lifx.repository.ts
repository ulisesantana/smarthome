import { Device } from '../domain'
import { http } from '../http'

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

export class LifxRepository {
  private readonly url = 'https://api.lifx.com/v1/lights'
  constructor (private readonly token: string) {
    if (token === '') {
      console.error('Missing Lifx token. Exiting application.')
      process.exit(1)
    }
  }

  async getAllLights (): Promise<Device[]> {
    const response = await http.get(`${this.url}/all`, {
      auth: {
        bearer: this.token
      }
    })
    const lights = response.toJSON().body
    return lights.map(LifxRepository.mapToDevice)
  }

  async setState (selector: string, options: StateOptions): Promise<void> {
    const body: StateOptions = {
      fast: false
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

    const response = await http.put(`${this.url}/${selector}/state`, {
      auth: {
        bearer: this.token
      },
      body
    })

    console.debug(`Lifx set state for ${selector}`, response.toJSON().body)
    console.debug(body)
    console.debug(`Response ${selector}`, response.statusMessage)
  }

  private static mapToDevice (device: LifxLight): Device {
    return ({
      id: device.id,
      name: device.label.trim(),
      type: 'bulb',
      brightness: device.brightness * 100,
      colorTemp: device.color.kelvin,
      power: device.power === 'on'
    })
  }
}
