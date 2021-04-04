export class SceneError extends Error {
  constructor (message: string) {
    super(`[Scene Error]: ${message}`)
  }
}
