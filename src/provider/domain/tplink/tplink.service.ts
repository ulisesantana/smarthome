import { TplinkRepository } from './tplink.repository'
import { ProviderService } from '../provider.service'
import { inject, injectable } from 'tsyringe'

@injectable()
export class TplinkService extends ProviderService {
  constructor (@inject(TplinkRepository) tplinkRepository: TplinkRepository) {
    super(tplinkRepository)
  }
}
