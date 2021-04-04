import S from 'fluent-json-schema'
import { lightStatus } from '../../light/infrastructure/light.schema'
import {
  generateInternalServerErrorSchema,
  generateNotFoundErrorSchema
} from '../../common'

export const sceneStatus = S.object()
  .title('Scene Status')
  .prop('id', S.string())
  .prop('name', S.string())
  .prop('icon', S.string())
  .prop('color', S.string())
  .prop('brightness', S.number())
  .prop('colorTemp', S.number())
  .prop('lights', S.array().items(lightStatus))

export const getSceneStatus = {
  tags: ['scenes'],
  summary: 'Get scenes status',
  response: {
    200: S.array()
      .description('Successful response')
      .items(sceneStatus),
    500: generateInternalServerErrorSchema('Error retrieving scenes.')
  }
}

export const getSceneStatusById = {
  tags: ['scenes'],
  summary: 'Get scene status by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(sceneStatus),
    404: generateNotFoundErrorSchema('Scene not found'),
    500: generateInternalServerErrorSchema('Error retrieving scene.')
  }
}

export const createScene = {
  tags: ['scenes'],
  summary: 'Create a new scene',
  body: S.object()
    .title('New scene to create')
    .prop('name', S.string())
    .prop('icon', S.string())
    .prop('color', S.string())
    .prop('brightness', S.number())
    .prop('colorTemp', S.number())
    .prop('lights', S.array().items(S.string())),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(sceneStatus),
    500: generateInternalServerErrorSchema('Error creating scene.')
  }
}

export const updateScene = {
  tags: ['scenes'],
  summary: 'Update existing scene',
  params: S.object().prop('id', S.string().required()),
  body: S.object()
    .title('Scene to update')
    .prop('name', S.string())
    .prop('icon', S.string())
    .prop('color', S.string())
    .prop('brightness', S.number())
    .prop('colorTemp', S.number())
    .prop('lights', S.array().items(S.string())),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(sceneStatus),
    404: generateNotFoundErrorSchema('Scene not found'),
    500: generateInternalServerErrorSchema('Error deleting scene.')
  }
}

export const deleteSceneById = {
  tags: ['scenes'],
  summary: 'Remove scene by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    204: S.object()
      .description('Successful response'),
    404: generateNotFoundErrorSchema('Scene not found'),
    500: generateInternalServerErrorSchema('Error deleting scene.')
  }
}

export const toggleLightsStatusById = {
  tags: ['scenes'],
  summary: 'Toggle scene lights by scene id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(sceneStatus),
    404: generateNotFoundErrorSchema('Scene not found'),
    500: generateInternalServerErrorSchema('Error toggling scene.')
  }
}
