import { Light, LightRepository } from '../../src/light'
import { buildServer } from '../../src/server'
import { MongoDB } from '../../src/common'
import { container } from 'tsyringe'
import { LifxRepository, Provider, TplinkRepository } from '../../src/provider'
import { buildLight } from '../../src/common/test'
import dotenv from 'dotenv'

dotenv.config()

let mockRepositories: Function
const lightsCollection = container.resolve(MongoDB).useCollection(LightRepository.collection)
const lightRepository = container.resolve(LightRepository)

describe('Smarthome API Bootstrap should', () => {
  beforeEach(async () => {
    await lightsCollection.removeCollection()

    const lifxRepository = container.resolve(LifxRepository)
    const tplinkRepository = container.resolve(TplinkRepository)
    container.registerInstance(LifxRepository, lifxRepository)
    container.registerInstance(TplinkRepository, tplinkRepository)

    mockRepositories = ({ lifxLights, tplinkLights }: Record<string, Light[]>) => {
      tplinkRepository.getAllLights = jest.fn(async () => tplinkLights)
      lifxRepository.getAllLights = jest.fn(async () => lifxLights)
    }
  })
  it('persist lights from providers', async () => {
    const lifxLights = [
      buildLight({ provider: Provider.Lifx }),
      buildLight({ provider: Provider.Lifx })
    ]
    const tplinkLights = [
      buildLight({ provider: Provider.TpLink }),
      buildLight({ provider: Provider.TpLink })
    ]
    const lightsFixture = [...lifxLights, ...tplinkLights]
    mockRepositories({ lifxLights, tplinkLights })
    let lights = await lightRepository.findAll()
    expect(lights).toHaveLength(0)

    const server = await buildServer()
    await server.close()

    lights = await lightRepository.findAll()
    expect(lights).toStrictEqual(lightsFixture)
  })
  it('notify if lights are found or not', async () => {
    console.info = jest.fn()
    mockRepositories({
      lifxLights: [
        buildLight({
          provider: Provider.Lifx,
          available: false,
          name: 'Lifx unavailable'
        }),
        buildLight({
          provider: Provider.Lifx,
          available: true,
          name: 'Lifx available'
        })
      ],
      tplinkLights: [
        buildLight({
          provider: Provider.TpLink,
          available: false,
          name: 'TP-Link unavailable'
        }),
        buildLight({
          provider: Provider.TpLink,
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
