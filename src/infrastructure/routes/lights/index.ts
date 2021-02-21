import { FastifyInstance } from 'fastify'
import { getLightStatus, toggleLightById, toggleLight } from './schema'
import {
  Device,
  DeviceService,
  OfficeUseCases,
  BedroomUseCases,
  TerraceUseCases
} from '../../../domain'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const deviceService = new DeviceService(server.tplink, server.lifx)
  const terraceUseCases = new TerraceUseCases(deviceService)
  const officeUseCases = new OfficeUseCases(deviceService)
  const bedroomUseCases = new BedroomUseCases(deviceService)

  server.get('/', { schema: getLightStatus },
    async function () {
      return await handleUseCasesResponse([
        deviceService.fetchDevices()
      ])
    }
  )

  server.patch<{ Params: { id: string } }>('/toggle/:id', { schema: toggleLightById },
    async function ({ params }) {
      return await handleUseCasesResponse([
        deviceService.toggleDeviceById(params.id)
      ])
    }
  )

  server.patch('/toggle/office', { schema: toggleLight },
    async function (): Promise<Device[]> {
      const officeLights = await handleUseCasesResponse([officeUseCases.toggleOffice()])
      return [
        officeLights,
        bedroomUseCases.getLights(),
        terraceUseCases.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/bedroom', { schema: toggleLight },
    async function () {
      const bedroomLights = await handleUseCasesResponse([bedroomUseCases.toggleBedroom()])
      return [
        bedroomLights,
        officeUseCases.getLights(),
        terraceUseCases.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/day', { schema: toggleLight },
    async function () {
      const lights = await handleUseCasesResponse([
        bedroomUseCases.toggleDayScene(),
        officeUseCases.toggleDayScene()
      ])
      return [
        lights,
        terraceUseCases.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/night', { schema: toggleLight },
    async function () {
      return await handleUseCasesResponse([
        bedroomUseCases.toggleNightScene(),
        terraceUseCases.toggleTerrace(),
        officeUseCases.toggleNightScene()
      ])
    }
  )

  server.patch('/toggle/scene/movie', { schema: toggleLight },
    async function () {
      const lights = await handleUseCasesResponse([
        bedroomUseCases.toggleMovieScene(),
        officeUseCases.toggleMovieScene()
      ])
      return [
        lights,
        terraceUseCases.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/relax', { schema: toggleLight },
    async function () {
      const lights = await handleUseCasesResponse([
        bedroomUseCases.toggleRelaxScene(),
        officeUseCases.toggleRelaxScene()
      ])
      return [
        lights,
        terraceUseCases.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )
}

async function handleUseCasesResponse (controllersActions: Array<Promise<Device[]>>): Promise<Device[]> {
  const allDevices = [] as Device[]
  for await (const devices of triggerUseCasesAction(controllersActions)) {
    allDevices.push(...devices)
  }
  return allDevices.sort(sortDevicesByName)
}

async function * triggerUseCasesAction (controllersActions: Array<Promise<Device[]>>): AsyncGenerator<Device[]> {
  for (const action of controllersActions) {
    const devices = await action
    yield devices
  }
}

function sortDevicesByName (deviceA: Device, deviceB: Device): number {
  return deviceA.name > deviceB.name
    ? 1
    : deviceA.name < deviceB.name
      ? -1
      : 0
}

export default lightsAPI
