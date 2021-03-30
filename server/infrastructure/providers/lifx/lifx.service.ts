import { LifxRepository } from './lifx.repository'
import { ProviderService } from '../../../common'

export class LifxService extends ProviderService {
  constructor (lifxRepository: LifxRepository) {
    super(lifxRepository)
  }
}
