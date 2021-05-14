export interface LightGroupRepository <Model, Entity> {
  getAll(): Promise<Model[]>
  getById(id: string): Promise<Model>
  create(entity: Entity): Promise<void>
  update(entity: Partial<Entity>): Promise<Entity>
  remove (id: string): Promise<void>
}
