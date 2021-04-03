export class RoomError extends Error {
  constructor (message: string) {
    super(`[Room Error]: ${message}`)
  }
}
