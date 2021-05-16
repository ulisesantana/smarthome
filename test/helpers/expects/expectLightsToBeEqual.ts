import { Light } from '../../../src/light'

export function expectLightsToBeEqual (light: Light, expectedLight: Light) {
  for (const key in light) {
    // @ts-ignore
    expect(light[key]).toBe(expectedLight[key])
  }
}
