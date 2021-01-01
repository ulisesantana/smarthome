import { MappedDevice, TplinkController } from './tplink.controller'

export class OfficeController {
  private readonly deviceName = 'Lampara mesa estudio'

  constructor (private readonly tplinkController: TplinkController) {}

  async togglePlug (): Promise<MappedDevice[]> {
    return await this.tplinkController.toggleDeviceByAlias(this.deviceName)
  }
}
