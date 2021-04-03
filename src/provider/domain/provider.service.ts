import { Light } from '../../light'

export enum Provider {
    TpLink = 'tplink',
    Lifx = 'lifx',
    Unknown = 'unknown'
}

export interface ProviderRepository {
    getAllLights: () => Promise<Light[]>
    setState: (light: Light) => Promise<void>
}

export abstract class ProviderService {
  protected constructor (private readonly repository: ProviderRepository) {}

  async init (dbLights: Light[]): Promise<Light[]> {
    const providerLights = await this.repository.getAllLights()
    const providerLightsIds = providerLights.map(({ id }) => id)
    const providerMissingLights = dbLights.filter(({ id }) => !providerLightsIds.includes(id))

    return [
      ...providerLights,
      ...providerMissingLights
    ]
  }

  async setLightState (light: Light): Promise<void> {
    await this.repository.setState(light)
  }
}
