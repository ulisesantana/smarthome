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
        server.tplink.getDevices(),
        server.lifx.getDevices()
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
      return await officeController.toggleOffice()
    }
  )

  server.patch('/toggle/bedroom', { schema: toggleLight },
    async function () {
      return await handleControllersResponse([
        bedroomController.toggleBedroom(),
        server.lifx.getDevices()
      ])
    }
  )

  server.patch('/toggle/scene/day', { schema: toggleLight },
    async function () {
      return await handleControllersResponse([
        bedroomController.toggleDayScene(),
        officeController.toggleDayScene()
      ])
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
      return await handleControllersResponse([
        bedroomController.toggleMovieScene(),
        officeController.toggleMovieScene()
      ])
    }
  )

  server.patch('/toggle/scene/relax', { schema: toggleLight },
    async function () {
      return await handleControllersResponse([
        bedroomController.toggleRelaxScene(),
        officeController.toggleRelaxScene()
      ])
    }
  )
}

async function handleControllersResponse (controllersActions: Array<Promise<Device[]>>): Promise<Device[]> {
  return (await Promise.all(controllersActions)).flat().sort(sortDevices)
}

function sortDevices (deviceA: Device, deviceB: Device): number {
  return deviceA.name > deviceB.name
    ? 1
    : deviceA.name < deviceB.name
      ? -1
      : 0
}

export default lightsAPI
