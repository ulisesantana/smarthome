import { Light, LightMongoRepository } from '../../src/light'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { BrandLifxRepository, Brand, BrandTplinkRepository } from '../../src/brand'
import { buildLight } from '../../src/common/test'
import dotenv from 'dotenv'

dotenv.config()

let mockRepositories: Function
const lightsCollection = container.resolve(MongoDB).useCollection(LightMongoRepository.collection)
const lightRepository = container.resolve(LightMongoRepository)

describe('Smarthome API Bootstrap should', () => {
  beforeEach(async () => {
    await lightsCollection.removeCollection()

    const lifxRepository = container.resolve(BrandLifxRepository)
    const tplinkRepository = container.resolve(BrandTplinkRepository)
    container.registerInstance(BrandLifxRepository, lifxRepository)
    container.registerInstance(BrandTplinkRepository, tplinkRepository)

    mockRepositories = ({ lifxLights, tplinkLights }: Record<string, Light[]>) => {
      tplinkRepository.getAllLights = jest.fn(async () => tplinkLights)
      lifxRepository.getAllLights = jest.fn(async () => lifxLights)
    }
  })
  it('persist lights from providers', async () => {
    const lifxLights = [
      buildLight({ provider: Brand.Lifx }),
      buildLight({ provider: Brand.Lifx })
    ]
    const tplinkLights = [
      buildLight({ provider: Brand.TpLink }),
      buildLight({ provider: Brand.TpLink })
    ]
    const lightsFixture = [...lifxLights, ...tplinkLights]
    mockRepositories({ lifxLights, tplinkLights })
    let lights = await lightRepository.getAll()
    expect(lights).toHaveLength(0)

    const server = await buildServer()
    await server.close()

    lights = await lightRepository.getAll()
    expect(lights).toStrictEqual(lightsFixture)
  })
  it('notify if lights are found or not', async () => {
    console.info = jest.fn()
    mockRepositories({
      lifxLights: [
        buildLight({
          provider: Brand.Lifx,
          available: false,
          name: 'Lifx unavailable'
        }),
        buildLight({
          provider: Brand.Lifx,
          available: true,
          name: 'Lifx available'
        })
      ],
      tplinkLights: [
        buildLight({
          provider: Brand.TpLink,
          available: false,
          name: 'TP-Link unavailable'
        }),
        buildLight({
          provider: Brand.TpLink,
          available: true,
          name: 'TP-Link available'
        })]
    })

    const server = await buildServer()
    await server.close()

    expect(console.info).toBeCalledWith('Light Lifx unavailable not found.')
    expect(console.info).toBeCalledWith('Found light Lifx available.')
    expect(console.info).toBeCalledWith('Light TP-Link unavailable not found.')
    expect(console.info).toBeCalledWith('Found light TP-Link available.')
  })
})
