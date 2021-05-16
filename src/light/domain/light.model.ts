import { Brand } from '../../brand'

export enum LightType {
  Bulb = 'bulb',
  Plug = 'plug'
}

interface LightConstructorParams {
  id: string
  name: string
  type?: LightType
  brightness?: number
  colorTemp?: number
  power?: boolean
  available?: boolean
  brand: Brand
}

export class Light {
  readonly #brand: Brand
  readonly #id: string
  readonly #type: LightType
  #available: boolean
  #brightness: number
  /**
   * Color temperature in Kelvin degrees.
   * Minimum:
   * @private
   */
  #colorTemp: number
  #name: string
  #power: boolean
  private static readonly maxBrightness = 100
  private static readonly minBrightness = 0
  /**
   * Minimum color temperature for a Light
   * @private
   */
  private static readonly warmLight = 2700
  /**
   * Maximum color temperature for a Light
   * @private
   */
  private static readonly whiteLight = 6500

  constructor (params: LightConstructorParams) {
    this.#id = params.id
    this.#name = params.name
    this.#type = params.type || LightType.Bulb
    this.#brightness = Light.validateWithMinAndMax(params.brightness || Light.maxBrightness, Light.minBrightness, Light.maxBrightness)
    this.#colorTemp = Light.validateWithMinAndMax(params.colorTemp || Light.warmLight, Light.warmLight, Light.whiteLight)
    this.#power = params.power ?? true
    this.#available = params.available ?? true
    this.#brand = params.brand
  }

  get id () { return this.#id }
  get name () { return this.#name }
  get brightness () { return this.#brightness }
  get colorTemp () { return this.#colorTemp }
  get power () { return this.#power }
  get available () { return this.#available }
  get type () { return this.#type }
  get brand () { return this.#brand }

  disable (): Light {
    this.#available = false
    return this
  }

  togglePower (): Light {
    this.#power = !this.#power
    return this
  }

  updateState (state: Partial<Light>): Light {
    if (state.name !== undefined) this.#name = state.name
    if (state.brightness !== undefined) this.#brightness = Light.validateWithMinAndMax(state.brightness, Light.minBrightness, Light.maxBrightness)
    if (state.colorTemp !== undefined) this.#colorTemp = Light.validateWithMinAndMax(state.colorTemp, Light.warmLight, Light.whiteLight)
    if (state.power !== undefined) this.#power = state.power
    if (state.available !== undefined) this.#available = state.available
    return this
  }

  private static validateWithMinAndMax (value: number, min: number, max: number): number {
    if (value > max) {
      return max
    } else if (value < min) {
      return min
    } else {
      return value
    }
  }
}
