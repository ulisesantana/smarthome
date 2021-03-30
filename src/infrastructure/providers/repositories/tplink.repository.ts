import { v4 } from 'uuid'
import { http } from '../../../http'
import { Device, DeviceType, Provider } from '../../../domain'

interface TpLinkDevice {
  deviceType: string
  role: number
  fwVer: string
  appServerUrl: string
  deviceRegion: string
  deviceId: string
  deviceName: string
  deviceHwVer: string
  alias: string
  deviceMac: string
  oemId: string
  deviceModel: string
  hwId: string
  fwId: string
  isSameRegion: boolean
  status: number
}

interface LightState {
  power: boolean
  brightness: number
  colorTemp: number
}

/**
 * TP-Link Repository
 * Class for handling TP-Link devices.
 * Based on tplink-cloud-api npm package
 * https://www.npmjs.com/package/tplink-cloud-api
 */
export class TplinkRepository {
  private readonly url = 'https://wap.tplinkcloud.com'
  private readonly oneHourInMs = 1000 * 60 * 60
  private expirationTime = Date.now()
  private token!: string
  private termID!: string
  private readonly deviceList = new Map<string, TpLinkDevice>()
  private static readonly headers = {
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 6.0.1; A0001 Build/M4B30X)',
    'Content-Type': 'application/json'
  }

  constructor (private readonly user: string, private readonly password: string) {
    if (user === '' || user === undefined) {
      throw new Error('Missing required user parameter for TPLink')
    } else if (password === '' || password === undefined) {
      throw new Error('Missing required password parameter for TPLink')
    }
  }

  async getAllDevices (): Promise<Device[]> {
    await this.refreshTokenIfIsExpired()
    const url = TplinkRepository.generateUrl(this.url, {
      appName: 'Kasa_Android',
      termID: this.termID,
      appVer: '1.4.4.607',
      ospf: 'Android+6.0.1',
      netType: 'wifi',
      locale: 'es_ES',
      token: this.token
    })
    const request = {
      method: 'POST',
      url: 'https://wap.tplinkcloud.com',
      headers: TplinkRepository.headers,
      body: { method: 'getDeviceList' }
    }

    const response = await http.post(url, request)
    response.toJSON().body.result.deviceList
      .forEach((device: TpLinkDevice) => this.deviceList.set(device.deviceId, device))
    return Promise.all([...this.deviceList.keys()].map(async (id) => await this.getDevice(id)))
  }

  async getDevice (id: string): Promise<Device> {
    const device = this.deviceList.get(id)
    if (device === undefined) {
      throw new Error(`TPLink device with id ${id} doesn't exist.`)
    } else {
      const deviceInfo = await this.passthroughRequest(device, { system: { get_sysinfo: {} } })
      return TplinkRepository.mapToDevice(device, {
        power: deviceInfo?.system?.get_sysinfo?.relay_state ?? deviceInfo?.system?.get_sysinfo?.light_state?.on_off,
        brightness: deviceInfo?.system?.get_sysinfo?.light_state?.dft_on_state?.brightness ?? 0,
        colorTemp: deviceInfo?.system?.get_sysinfo?.light_state?.dft_on_state?.color_temp ?? 0
      })
    }
  }

  async setState (device: Device): Promise<Device> {
    const rawDevice = this.deviceList.get(device.id)
    if (rawDevice !== undefined) {
      if (TplinkRepository.isABulb(rawDevice)) {
        await this.setBulbState(rawDevice, device)
      } else {
        await this.setPlugState(rawDevice, device.power)
      }
      return await this.getDevice(device.id)
    } else {
      return device
    }
  }

  private async setBulbState (device: TpLinkDevice, deviceState: LightState): Promise<void> {
    const result = await this.passthroughRequest(device, {
      'smartlife.iot.smartbulb.lightingservice': {
        transition_light_state: {
          brightness: deviceState.brightness,
          color_temp: deviceState.colorTemp,
          on_off: Number(deviceState.power)
        }
      }
    })
    console.debug('setBulbState', JSON.stringify(result, null, 2))
  }

  private async setPlugState (device: TpLinkDevice, power: boolean): Promise<void> {
    const result = await this.passthroughRequest(device, {
      system: { set_relay_state: { state: Number(power) } }
    })
    console.debug('setPlugState', JSON.stringify(result, null, 2))
  }

  private async login (): Promise<void> {
    const termID: string = v4()
    const url = TplinkRepository.generateUrl(this.url, {
      appName: 'Kasa_Android',
      termID,
      appVer: '1.4.4.607',
      ospf: 'Android+6.0.1',
      netType: 'wifi',
      locale: 'es_ES'
    })
    const request = {
      body: {
        method: 'login',
        url: this.url,
        params: {
          appType: 'Kasa_Android',
          cloudPassword: this.password,
          cloudUserName: this.user,
          terminalUUID: termID
        }
      },
      headers: TplinkRepository.headers
    }

    const response = await http.post(url, request)
    this.token = response.toJSON().body.result.token
    this.termID = termID
    this.expirationTime = Date.now() + this.oneHourInMs
  }

  private async passthroughRequest (device: TpLinkDevice, command: Record<string, any>): Promise<Record<string, any>> {
    await this.refreshTokenIfIsExpired()
    const url = TplinkRepository.generateUrl(device.appServerUrl, {
      appName: 'Kasa_Android',
      termID: this.termID,
      appVer: '1.4.4.607',
      ospf: 'Android+6.0.1',
      netType: 'wifi',
      locale: 'es_ES',
      token: this.token
    })
    const request = {
      headers: {
        ...TplinkRepository.headers,
        'cache-control': 'no-cache'
      },
      body: {
        method: 'passthrough',
        params: {
          deviceId: device.deviceId,
          requestData: JSON.stringify(command)
        }
      }
    }

    const response = await http.post(url, request)
    const data = response.toJSON().body
    return data?.result?.responseData !== undefined
      ? JSON.parse(data.result.responseData)
      : data
  }

  private static mapToDevice (device: TpLinkDevice, deviceState: LightState): Device {
    if (TplinkRepository.isABulb(device)) {
      return ({
        id: device.deviceId,
        name: device.alias,
        type: DeviceType.Bulb,
        brightness: deviceState.brightness ?? 0,
        colorTemp: deviceState.colorTemp ?? 0,
        power: Boolean(deviceState.power),
        provider: Provider.TpLink
      })
    } else {
      return ({
        id: device.deviceId,
        name: device.alias,
        type: DeviceType.Plug,
        brightness: 0,
        colorTemp: 0,
        power: Boolean(deviceState.power),
        provider: Provider.TpLink
      })
    }
  }

  private static isABulb (device: TpLinkDevice): boolean {
    return device.deviceName.includes('Bulb')
  }

  private static generateUrl (url: string, queryParams: Record<string, string | number>): string {
    return url.concat(
      '?' + Object.entries(queryParams)
        .reduce<string[]>((result, [key, value]) => [...result, `${key}=${value}`], [])
        .join('&')
    )
  }

  private async refreshTokenIfIsExpired (): Promise<void> {
    if (Date.now() >= this.expirationTime) {
      await this.login()
    }
  }
}
