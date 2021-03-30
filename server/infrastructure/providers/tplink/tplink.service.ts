import { DeviceRepository } from '../../../domain'
import { TplinkRepository } from './tplink.repository'
import { Provider, ProviderService } from '../../../common'

export class TplinkService extends ProviderService {
  constructor (tplinkRepository: TplinkRepository, deviceRepository: DeviceRepository) {
    super({
      providerRepository: tplinkRepository,
      deviceRepository,
      provider: Provider.TpLink
    })
  }
}
