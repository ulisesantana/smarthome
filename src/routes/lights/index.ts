import { FastifyInstance } from 'fastify'
import { OfficeController } from '../../controllers/office.controller'
import { BedroomController } from '../../controllers/bedroom.controller'
import { MappedDevice } from '../../controllers/tplink.controller'
import { getLightStatus, toggleLightById, toggleLight } from './schema'

async function lightsAPI (server: FastifyInstance): Promise<void> {
  const officeController = new OfficeController(server.tplink)
  const bedroomController = new BedroomController(server.tplink)

  server.get('/', { schema: getLightStatus },
    async function () {
      return await server.tplink.devices
    }
  )

  server.patch('/toggle/:id', { schema: toggleLightById },
    async function ({ params }) {
      // @ts-expect-error
      return await server.tplink.toggleDeviceById(params.id)
    }
  )

  server.patch('/toggle/office', { schema: toggleLight },
    async function (): Promise<MappedDevice[]> {
      return await officeController.togglePlug()
    }
  )

  server.patch('/toggle/bedroom', { schema: toggleLight },
    async function () {
      return await bedroomController.toggleBedroom()
    }
  )

  server.patch('/toggle/bedroom/scene/day', { schema: toggleLight },
    async function () {
      return await bedroomController.toggleDayScene()
    }
  )

  server.patch('/toggle/bedroom/scene/night', { schema: toggleLight },
    async function () {
      return await bedroomController.toggleNightScene()
    }
  )

  server.patch('/toggle/bedroom/scene/movie', { schema: toggleLight },
    async function () {
      return await bedroomController.toggleMovieScene()
    }
  )

  server.patch('/toggle/bedroom/scene/relax', { schema: toggleLight },
    async function () {
      return await bedroomController.toggleRelaxScene()
    }
  )
}

export default lightsAPI
