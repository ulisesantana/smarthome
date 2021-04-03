export class LightError extends Error {
  constructor (message: string) {
    super(`[Light Error]: ${message}`)
  }
}
