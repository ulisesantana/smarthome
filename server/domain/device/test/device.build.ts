import { Device, DeviceType } from '../device.model'
import { generateId, Provider } from '../../../common'

export function buildDevice (device: Partial<Device> = {}): Device {
  return {
    available: device.available ?? true,
    brightness: device.brightness ?? 100,
    colorTemp: device.colorTemp ?? 2700,
    id: device.id ?? generateId(),
    name: device.name ?? 'Irrelevant light',
    power: device.power ?? true,
    provider: device.provider ?? Provider.Lifx,
    type: device.type ?? DeviceType.Bulb
  }
}
