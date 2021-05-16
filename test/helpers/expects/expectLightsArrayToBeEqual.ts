import { Light } from '../../../src/light'

export function expectLightsArrayToBeEqual (lights: Light[], expectedLights: Light[]) {
  for (const [index, light] of lights.entries()) {
    for (const key in light) {
      // @ts-ignore
      expect(light[key]).toBe(expectedLights[index][key])
    }
  }
}
