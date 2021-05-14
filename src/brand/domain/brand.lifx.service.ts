import { BrandLifxRepository } from '../infrastructure/brand.lifx.repository'
import { BrandService } from './brand.service'
import { inject, injectable } from 'tsyringe'

@injectable()
export class BrandLifxService extends BrandService {
  constructor (@inject(BrandLifxRepository) lifxRepository: BrandLifxRepository) {
    super(lifxRepository)
  }
}
