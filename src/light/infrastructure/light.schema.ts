import S from 'fluent-json-schema'
import {
  generateInternalServerErrorSchema,
  generateNotFoundErrorSchema
} from '../../common'

export const lightStatus = S.object()
  .title('Light Status')
  .prop('id', S.string().required())
  .prop('power', S.boolean().required())
  .prop('name', S.string().required())
  .prop('type', S.string().required())
  .prop('brightness', S.number())
  .prop('brand', S.string())
  .prop('available', S.boolean())
  .prop('colorTemp', S.number())

export const getLightStatus = {
  tags: ['lights'],
  summary: 'Get light status',
  response: {
    200: S.array()
      .description('Successful response')
      .items(lightStatus),
    500: generateInternalServerErrorSchema('Error retrieving lights.')
  }
}

export const toggleLightById = {
  tags: ['lights'],
  summary: 'Toggle device by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(lightStatus),
    404: generateNotFoundErrorSchema('Light not found'),
    500: generateInternalServerErrorSchema('Error toggling light.')
  }
}

// TODO: Remove colorTemp validation and test it
export const updateLightStatusById = {
  tags: ['lights'],
  summary: 'Update light status by id',
  params: S.object().prop('id', S.string().required()),
  body: S.object()
    .prop('power', S.boolean())
    .prop('colorTemp', S.number())
    .prop('brightness', S.number()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(lightStatus),
    404: generateNotFoundErrorSchema('Light not found'),
    500: generateInternalServerErrorSchema('Error updating light.')
  }
}
