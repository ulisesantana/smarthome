import { BrandTplinkRepository } from '../infrastructure/brand.tplink.repository'
import { BrandService } from './brand.service'
import { inject, injectable } from 'tsyringe'

@injectable()
export class BrandTplinkService extends BrandService {
  constructor (@inject(BrandTplinkRepository) tplinkRepository: BrandTplinkRepository) {
    super(tplinkRepository)
  }
}
