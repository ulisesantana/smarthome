import { buildLight } from '../../common/test'
import { Light, LightType } from './light.model'
import { Brand } from '../../brand/domain/brand.service'

describe('Light should', () => {
  it('be instantiated with default values', () => {
    const light = new Light({
      id: 'irrelevantId',
      name: 'irrelevant name',
      brand: Brand.Lifx
    })

    expect(light.available).toBe(true)
    expect(light.brightness).toBe(100)
    expect(light.colorTemp).toBe(2700)
    expect(light.power).toBe(true)
    expect(light.type).toBe(LightType.Bulb)
  })

  it('be able to be toggled', () => {
    const light = buildLight({ power: true })

    light.togglePower()

    expect(light.power).toBeFalsy()

    light.togglePower()

    expect(light.power).toBeTruthy()
  })

  it('be able to be disabled', () => {
    const light = buildLight({ available: true })

    light.disable()

    expect(light.available).toBeFalsy()
  })

  describe('update its status with', () => {
    it('given values', () => {
      const light = buildLight({
        available: true,
        brightness: 50,
        colorTemp: 3200,
        name: 'irrelevant light',
        power: true
      })
      const update = {
        available: false,
        brightness: 25,
        colorTemp: 5000,
        name: 'updated light',
        power: false
      }

      light.updateState(update)

      expect(light.available).toBe(update.available)
      expect(light.brightness).toBe(update.brightness)
      expect(light.colorTemp).toBe(update.colorTemp)
      expect(light.name).toBe(update.name)
      expect(light.power).toBe(update.power)
    })
    it('a max brightness of 100', () => {
      const light = buildLight({ brightness: 50 })

      light.updateState({ brightness: 500 })

      expect(light.brightness).toBe(100)
    })
    it('a min brightness of 0', () => {
      const light = buildLight({ brightness: 50 })

      light.updateState({ brightness: -100 })

      expect(light.brightness).toBe(0)
    })
    it('a max color temperature of 6500', () => {
      const light = buildLight({ colorTemp: 3200 })

      light.updateState({ colorTemp: 12000 })

      expect(light.colorTemp).toBe(6500)
    })
    it('a max color temperature of 2700', () => {
      const light = buildLight({ colorTemp: 3200 })

      light.updateState({ colorTemp: 0 })

      expect(light.colorTemp).toBe(2700)
    })
  })
})
