import { FastifyInstance } from 'fastify'
import { OfficeController, BedroomController, TerraceController } from '../../controllers'
import { getLightStatus, toggleLightById, toggleLight } from './schema'
import { Device } from '../../domain'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const terraceController = new TerraceController(server.lifx)
  const officeController = new OfficeController(server.tplink, server.lifx)
  const bedroomController = new BedroomController(server.tplink)

  server.get('/', { schema: getLightStatus },
    async function () {
      return await handleControllersResponse([
        server.tplink.fetchDevices(),
        server.lifx.fetchDevices()
      ])
    }
  )

  server.patch<{ Params: { id: string } }>('/toggle/:id', { schema: toggleLightById },
    async function ({ params }) {
      return await handleControllersResponse([
        server.tplink.toggleDeviceById(params.id),
        server.lifx.toggleDeviceById(params.id)
      ])
    }
  )

  server.patch('/toggle/office', { schema: toggleLight },
    async function (): Promise<Device[]> {
      const officeLights = await handleControllersResponse([officeController.toggleOffice()])
      return [
        officeLights,
        bedroomController.getLights(),
        terraceController.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/bedroom', { schema: toggleLight },
    async function () {
      const bedroomLights = await handleControllersResponse([bedroomController.toggleBedroom()])
      return [
        bedroomLights,
        officeController.getLights(),
        terraceController.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/day', { schema: toggleLight },
    async function () {
      const lights = await handleControllersResponse([
        bedroomController.toggleDayScene(),
        officeController.toggleDayScene()
      ])
      return [
        lights,
        terraceController.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/night', { schema: toggleLight },
    async function () {
      return await handleControllersResponse([
        bedroomController.toggleNightScene(),
        terraceController.toggleTerrace(),
        officeController.toggleNightScene()
      ])
    }
  )

  server.patch('/toggle/scene/movie', { schema: toggleLight },
    async function () {
      const lights = await handleControllersResponse([
        bedroomController.toggleMovieScene(),
        officeController.toggleMovieScene()
      ])
      return [
        lights,
        terraceController.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )

  server.patch('/toggle/scene/relax', { schema: toggleLight },
    async function () {
      const lights = await handleControllersResponse([
        bedroomController.toggleRelaxScene(),
        officeController.toggleRelaxScene()
      ])
      return [
        lights,
        terraceController.getLights()
      ].flat().sort(sortDevicesByName)
    }
  )
}

async function handleControllersResponse (controllersActions: Array<Promise<Device[]>>): Promise<Device[]> {
  const allDevices = [] as Device[]
  for await (const devices of triggerControllerAction(controllersActions)) {
    allDevices.push(...devices)
  }
  return allDevices.sort(sortDevicesByName)
}

async function * triggerControllerAction (controllersActions: Array<Promise<Device[]>>): AsyncGenerator<Device[]> {
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
