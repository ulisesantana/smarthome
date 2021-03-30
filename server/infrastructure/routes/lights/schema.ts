import S from 'fluent-json-schema'
import { DeviceService } from '../../../domain'
// 8006BCAF2C5869DDB91F9E0C0ADC196C1BA3B381

const lightStatusExample = {
  id: '8012B8B0F5D53BA83219C34E90520A131884C091',
  name: 'Puerta Terraza',
  type: 'bulb',
  brightness: 100,
  colorTemp: 2700,
  power: true
}

export const lightStatus = S.object()
  .title('LightStatus')
  .prop('id', S.string().required())
  .prop('power', S.boolean().required())
  .prop('name', S.string().required())
  .prop('type', S.string().required())
  .prop('brightness', S.string())
  .prop('colorTemp', S.string())
  .examples([lightStatusExample])

export const lightStatusResponse = S.array()
  .description('Successful response')
  .items(lightStatus)

export const getLightStatus = {
  tags: ['lights'],
  summary: 'Get light status',
  response: {
    200: lightStatusResponse
  }
}

export const toggleLightById = {
  tags: ['lights'],
  summary: 'Toggle device by id',
  params: S.object().prop('id', S.string().required()),
  response: {
    200: lightStatusResponse
  }
}

export const updateLightStatusById = {
  tags: ['lights'],
  summary: 'Update light status by id',
  params: S.object().prop('id', S.string().required()),
  body: S.object()
    .prop('power', S.boolean())
    .prop('colorTemp', S.number().minimum(DeviceService.warmLight).maximum(DeviceService.whiteLight))
    .prop('brightness', S.number().minimum(0).maximum(100))
    .examples([{ power: true, colorTemp: 3200, brightness: 50 }]),
  response: {
    200: lightStatusResponse
  }
}
