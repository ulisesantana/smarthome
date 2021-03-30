import { LifxRepository } from './lifx.repository'
import { DeviceRepository } from '../../../domain'
import { ProviderService, Provider } from '../../../common'

export class LifxService extends ProviderService {
  constructor (lifxRepository: LifxRepository, deviceRepository: DeviceRepository) {
    super({
      providerRepository: lifxRepository,
      deviceRepository,
      provider: Provider.Lifx
    })
  }
}
