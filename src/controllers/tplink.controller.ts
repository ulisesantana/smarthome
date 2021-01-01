import { Bulb, Client, Device, Plug } from 'tplink-smarthome-api'

export interface MappedDevice {
  id: string
  name: string
  type: string
  brightness?: number
  colorTemp?: number
  power: boolean
}

export class TplinkController {
  #devices = new Map()

  async init (timeout = 1000): Promise<void> {
    const start = Date.now()
    const client = new Client()
    const devices = new Map()

    client.startDiscovery({ discoveryTimeout: timeout }).on('device-new', (device: Device) => {
      devices.set(device.alias, device)
      console.debug(`Discovered device ${device.alias.trim()} ${(Date.now() - start) / 1000} seconds after starting the app.`)
    })

    setTimeout(() => {
      this.#devices = devices
    }, timeout)
  }

  get devices (): Promise<MappedDevice[]> {
    return Promise.all([...this.#devices.values()].filter(Boolean).map(async device => await this.transformDevice(device)))
  }

  getDevice (alias: string): Device {
    return this.#devices.get(alias)
  }

  async toggleDeviceByAlias (alias: string): Promise<MappedDevice[]> {
    const device = this.#devices.get(alias)
    await device.togglePowerState()
    return await this.devices
  }

  async toggleDeviceById (deviceId: string): Promise<MappedDevice[]> {
    const device = [...this.#devices.values()].find(({ id }) => id === deviceId)
    await device.togglePowerState()
    return await this.devices
  }

  async transformDevice (device: Device): Promise<MappedDevice> {
    if (this.isABulb(device)) {
      const lightState = await device.lighting.getLightState()
      return ({
        id: device.id,
        name: device.alias,
        type: 'bulb',
        brightness: lightState.brightness,
        colorTemp: lightState.color_temp,
        power: Boolean(lightState.on_off)
      })
    } else {
      return ({
        id: device.id,
        name: device.alias,
        type: 'plug',
        power: await (device as Plug).getPowerState()
      })
    }
  }

  private isABulb (device: Device): device is Bulb {
    return 'lighting' in device
  }
}
