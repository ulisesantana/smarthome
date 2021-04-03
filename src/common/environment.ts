import { injectable } from 'tsyringe'

enum Environments {
    Production = 'production',
    Development = 'development',
    Test = 'test'
}

@injectable()
export class Environment {
  isProduction () {
    return process.env.NODE_ENV === Environments.Production
  }

  isDevelopment () {
    return process.env.NODE_ENV === Environments.Development
  }

  isTest () {
    return process.env.NODE_ENV === Environments.Test
  }
}
