import { LightGroup } from '../../common/domain/lightGroup/lightGroup.model'

export interface Scene extends LightGroup{
    brightness: number
    colorTemp: number
}

export type SceneEntity = Omit<Scene, 'lights'> & {
    lights: string[]
}

export type SceneRequest = Omit<SceneEntity, 'id'>
