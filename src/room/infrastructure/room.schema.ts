import S from 'fluent-json-schema'
import { lightStatus } from '../../light/infrastructure/light.schema'

const roomStatusExample = {
  color: 'dodgerblue',
  devices: [
    {
      available: true,
      brightness: 100,
      colorTemp: 2700,
      id: 'irrelevantDevice1',
      name: 'Irrelevant light',
      power: false,
      provider: 'lifx',
      type: 'bulb'
    },
    {
      available: true,
      brightness: 100,
      colorTemp: 2700,
      id: 'irrelevantDevice2',
      name: 'Irrelevant light',
      power: false,
      provider: 'lifx',
      type: 'bulb'
    },
    {
      available: true,
      brightness: 100,
      colorTemp: 2700,
      id: 'irrelevantDevice3',
      name: 'Irrelevant light',
      power: false,
      provider: 'lifx',
      type: 'bulb'
    }
  ],
  icon: 'bedtime',
  id: 'irrelevantRoomId',
  name: 'Bedroom'
}

export const roomStatus = S.object()
  .title('Room Status')
  .prop('id', S.string().required())
  .prop('name', S.string().required())
  .prop('icon', S.string().required())
  .prop('color', S.string().required())
  .prop('devices', S.array().items(lightStatus).required())
  .examples([roomStatusExample])

export const roomStatusResponse = S.array()
  .description('Successful response')
  .items(roomStatus)

export const getRoomStatus = {
  tags: ['rooms'],
  summary: 'Get rooms status',
  response: {
    200: roomStatusResponse
  }
}

export const getRoomStatusById = {
  tags: ['rooms'],
  summary: 'Get room status by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: S.object()
      .description('Successful response')
      .extend(roomStatus)

  }
}
