import S from 'fluent-json-schema'
import { lightStatus } from '../../light/infrastructure/light.schema'
import {
  generateInternalServerErrorSchema,
  generateNotFoundErrorSchema
} from '../../common'

export const roomStatus = S.object()
  .title('Room Status')
  .prop('id', S.string().required())
  .prop('name', S.string().required())
  .prop('icon', S.string().required())
  .prop('color', S.string().required())
  .prop('lights', S.array().items(lightStatus).required())

export const getRoomStatus = {
  tags: ['rooms'],
  summary: 'Get rooms status',
  response: {
    200: S.array()
      .description('Successful response')
      .items(roomStatus),
    500: generateInternalServerErrorSchema('Error retrieving rooms.')
  }
}

export const getRoomStatusById = {
  tags: ['rooms'],
  summary: 'Get room status by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(roomStatus),
    404: generateNotFoundErrorSchema('Room not found'),
    500: generateInternalServerErrorSchema('Error retrieving room.')
  }
}

export const createRoom = {
  tags: ['rooms'],
  summary: 'Create a new room',
  body: S.object()
    .title('New room to create')
    .prop('name', S.string())
    .prop('icon', S.string())
    .prop('color', S.string())
    .prop('lights', S.array().items(S.string())),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(roomStatus),
    500: generateInternalServerErrorSchema('Error creating room.')
  }
}

export const updateRoom = {
  tags: ['rooms'],
  summary: 'Update existing room',
  params: S.object().prop('id', S.string().required()),
  body: S.object()
    .title('Room to update')
    .prop('name', S.string())
    .prop('icon', S.string())
    .prop('color', S.string())
    .prop('lights', S.array().items(S.string())),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(roomStatus),
    500: generateInternalServerErrorSchema('Error deleting room.')
  }
}

export const deleteRoomById = {
  tags: ['rooms'],
  summary: 'Remove room by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    204: S.object()
      .description('Successful response'),
    500: generateInternalServerErrorSchema('Error deleting room.')
  }
}

export const toggleLightsStatusById = {
  tags: ['rooms'],
  summary: 'Toggle room lights by room id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(roomStatus),
    500: generateInternalServerErrorSchema('Error toggling room.')
  }
}
