export class DeviceError extends Error {
  constructor (message: string) {
    super(`[Device Error]: ${message}`)
  }
}
