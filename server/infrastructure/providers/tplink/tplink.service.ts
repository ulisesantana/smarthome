import { TplinkRepository } from './tplink.repository'
import { ProviderService } from '../../../common'

export class TplinkService extends ProviderService {
  constructor (tplinkRepository: TplinkRepository) {
    super(tplinkRepository)
  }
}
