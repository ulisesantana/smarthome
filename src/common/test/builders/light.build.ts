import { Light, LightType } from '../../../light'
import { generateId } from '../../index'
import { Brand } from '../../../brand'

export function buildLight (light: Partial<Light> = {}): Light {
  return new Light({
    available: light.available ?? true,
    brightness: light.brightness ?? 100,
    colorTemp: light.colorTemp ?? 2700,
    id: light.id ?? generateId(),
    name: light.name ?? 'Irrelevant light',
    power: light.power ?? true,
    brand: light.brand ?? Brand.Lifx,
    type: light.type ?? LightType.Bulb
  })
}
