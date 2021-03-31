import { Device, DeviceType } from '../../domain'
import { generateId, Provider } from '../index'

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
