import { http, generateId, Environment, MongoDB, MongoAPI } from '../../../common'
import { Light, LightType } from '../../../light'
import { Provider, ProviderRepository } from '../provider.service'
import { inject, injectable } from 'tsyringe'

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
@injectable()
export class TplinkRepository implements ProviderRepository {
    private static collection = 'tplinkDevices'
    private readonly mongodb: MongoAPI
    private readonly url = 'https://wap.tplinkcloud.com'
    private readonly oneHourInMs = 1000 * 60 * 60
    private readonly user: string
    private readonly password: string
    private expirationTime = Date.now()
    private token!: string
    private termID!: string
    private static readonly headers = {
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 6.0.1; A0001 Build/M4B30X)',
      'Content-Type': 'application/json'
    }

    constructor (
        @inject(Environment) private readonly environment: Environment,
        @inject(MongoDB) instance: MongoDB
    ) {
      this.user = process.env.TPLINK_USER || ''
      this.password = process.env.TPLINK_PASS || ''
      this.mongodb = instance.useCollection(TplinkRepository.collection)
      if (this.environment.isProduction()) {
        if (!this.user) {
          console.error('Missing required user parameter for TPLink')
          process.exit(1)
        }
        if (!this.password) {
          console.error('Missing required password parameter for TPLink')
          process.exit(1)
        }
      }
    }

    async getAllLights (): Promise<Light[]> {
      await this.refreshTokenIfIsExpired()
      const url = TplinkRepository.generateUrlWithQueryString(this.url, {
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
      const { deviceList } = response.toJSON().body.result
      await this.saveDeviceList(deviceList)
      const lights = []
      // FIXME Move this to an async iterator
      for (const { deviceId } of deviceList) {
        lights.push(await this.getDevice(deviceId))
      }
      return lights
    }

    async setState (device: Light): Promise<void> {
      const rawDevice = await this.getTpLinkDevice(device.id)
      if (rawDevice?.deviceId !== undefined) {
        if (TplinkRepository.isABulb(rawDevice)) {
          await this.setBulbState(rawDevice, device)
        } else {
          await this.setPlugState(rawDevice, device.power)
        }
      }
    }

    private async saveDeviceList (devices: TpLinkDevice[]): Promise<void> {
      // FIXME Move this to an async iterator
      for (const device of devices) {
        await this.mongodb.upsertOne({ deviceId: device.deviceId }, device)
      }
    }

    private async getDevice (id: string): Promise<Light> {
      const device = await this.getTpLinkDevice(id)
      if (device?.deviceId === undefined) {
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

    private getTpLinkDevice (id: string): Promise<TpLinkDevice> {
      return this.mongodb.findOne<TpLinkDevice>({ deviceId: id })
    }

    private async setBulbState (device: TpLinkDevice, deviceState: LightState): Promise<void> {
      await this.passthroughRequest(device, {
        'smartlife.iot.smartbulb.lightingservice': {
          transition_light_state: {
            brightness: deviceState.brightness,
            color_temp: deviceState.colorTemp,
            on_off: Number(deviceState.power)
          }
        }
      })
    }

    private async setPlugState (device: TpLinkDevice, power: boolean): Promise<void> {
      await this.passthroughRequest(device, {
        system: { set_relay_state: { state: Number(power) } }
      })
    }

    private async login (): Promise<void> {
      const termID: string = generateId()
      const url = TplinkRepository.generateUrlWithQueryString(this.url, {
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
      const url = TplinkRepository.generateUrlWithQueryString(device.appServerUrl, {
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

    private static mapToDevice (device: TpLinkDevice, deviceState: LightState): Light {
      if (TplinkRepository.isABulb(device)) {
        return ({
          id: device.deviceId,
          name: device.alias,
          type: LightType.Bulb,
          brightness: deviceState.brightness ?? 0,
          colorTemp: deviceState.colorTemp ?? 0,
          power: Boolean(deviceState.power),
          available: true,
          provider: Provider.TpLink
        })
      } else {
        return ({
          id: device.deviceId,
          name: device.alias,
          type: LightType.Plug,
          brightness: 0,
          colorTemp: 0,
          power: Boolean(deviceState.power),
          available: true,
          provider: Provider.TpLink
        })
      }
    }

    private static isABulb (device: TpLinkDevice): boolean {
      return device.deviceName.includes('Bulb')
    }

    private static generateUrlWithQueryString (url: string, queryParams: Record<string, string | number>): string {
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