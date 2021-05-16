import { LightGroupRepository } from './lightGroup.repository'
import { Lights, LightService } from '../../light'
import { LightGroup, LightGroupEntity } from './lightGroup.model'

export class LightGroupService<Model extends LightGroup, Entity extends LightGroupEntity> {
  constructor (
        protected readonly lightService: LightService,
        protected readonly repository: LightGroupRepository<Model, Entity>
  ) {}

  async create (entity: Entity): Promise<Model> {
    await this.repository.create(entity)
    const lights = await this.lightService.getLightsById(entity.lights)
    return {
      ...entity,
      lights
    } as Model
  }

  async getById (id: string): Promise<Model> {
    return this.repository.getById(id)
  }

  async getAll (): Promise<Model[]> {
    return this.repository.getAll()
  }

  async update (id: string, update: Partial<Entity>): Promise<Model> {
    const model = await this.getById(id)
    if (model?.id !== undefined) {
      const updatedRoomWihtoutLights = await this.repository.update({ id, ...update })
      const lights = await this.lightService.getLightsById(updatedRoomWihtoutLights.lights)
      return { ...updatedRoomWihtoutLights, lights } as Model
    }
    return model
  }

  async remove (id: string): Promise<boolean> {
    const model = await this.getById(id)
    if (model?.id !== undefined) {
      await this.repository.remove(id)
      return true
    }
    return false
  }

  protected async toggleLightGroupById (id: string): Promise<Model> {
    const model = await this.getById(id)
    const updatedLights = []
    if (model?.id !== undefined) {
      for await (const light of this.lightService.toggleLights(model.lights)) {
        updatedLights.push(light)
      }
      model.lights = new Lights(updatedLights)
    }
    return model
  }
}
