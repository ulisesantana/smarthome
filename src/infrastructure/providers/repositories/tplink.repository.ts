import { Bulb, Client, Device as TpLinkDevice, Plug } from 'tplink-smarthome-api'
import { Device, DeviceType, Provider } from '../../../domain'

export class TplinkRepository {
  private readonly discoveryTimeout = 2000
  private readonly devices = new Map<string, TpLinkDevice>()
  private readonly client = new Client()

  async getAllDevices (): Promise<Device[]> {
    await this.scan()
    return await Promise.all([...this.devices.values()].map(TplinkRepository.mapToDevice))
  }

  async setState (device: Device): Promise<Device> {
    const rawDevice = this.devices.get(device.name)
    if (rawDevice !== undefined) {
      if (TplinkRepository.isABulb(rawDevice)) {
        await rawDevice.lighting.setLightState({
          brightness: device.brightness,
          color_temp: device.colorTemp,
          on_off: device.power ? 1 : 0
        })
      } else {
        await (rawDevice as Plug).setPowerState(device.power)
      }
      return await TplinkRepository.mapToDevice(rawDevice)
    } else {
      return device
    }
  }

  // eslint-disable-next-line
  private scan (): Promise<void> {
    return new Promise((resolve) => {
      const start = Date.now()

      this.client.startDiscovery({ discoveryTimeout: this.discoveryTimeout }).on('device-new', (device: TpLinkDevice) => {
        this.devices.set(device.alias.trim(), device)
        console.debug(`Discovered device ${device.alias.trim()} ${(Date.now() - start) / 1000} seconds after starting the app.`)
      })

      setTimeout(resolve, this.discoveryTimeout)
    })
  }

  private static async mapToDevice (device: TpLinkDevice): Promise<Device> {
    if (TplinkRepository.isABulb(device)) {
      const lightState = await device.lighting.getLightState()
      return ({
        id: device.id,
        name: device.alias,
        type: DeviceType.Bulb,
        brightness: lightState.brightness ?? 0,
        colorTemp: lightState.color_temp ?? 0,
        power: Boolean(lightState.on_off),
        provider: Provider.TpLink
      })
    } else {
      return ({
        id: device.id,
        name: device.alias,
        type: DeviceType.Plug,
        brightness: 0,
        colorTemp: 0,
        power: await (device as Plug).getPowerState(),
        provider: Provider.TpLink
      })
    }
  }

  private static isABulb (device: TpLinkDevice): device is Bulb {
    return device !== undefined && 'lighting' in device
  }
}
