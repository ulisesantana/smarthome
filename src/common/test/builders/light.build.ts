import { Light, LightType } from '../../../light'
import { generateId } from '../../index'
import { Brand } from '../../../brand'

export function buildLight (light: Partial<Light> = {}): Light {
  return {
    available: light.available ?? true,
    brightness: light.brightness ?? 100,
    colorTemp: light.colorTemp ?? 2700,
    id: light.id ?? generateId(),
    name: light.name ?? 'Irrelevant light',
    power: light.power ?? true,
    provider: light.provider ?? Brand.Lifx,
    type: light.type ?? LightType.Bulb
  }
}
