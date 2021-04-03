import { LifxRepository } from './lifx.repository'
import { ProviderService } from '../provider.service'
import { inject, injectable } from 'tsyringe'

@injectable()
export class LifxService extends ProviderService {
  constructor (@inject(LifxRepository) lifxRepository: LifxRepository) {
    super(lifxRepository)
  }
}
