import { injectable } from 'tsyringe'

enum Environments {
    Production = 'production',
    Development = 'development',
    Test = 'test'
}

interface EnvironmentVariables {
    lifxToken: string
    tplinkUser: string
    tplinkPassword: string
    mongoUser: string
    mongoPassword: string
    mongoHost: string
    mongoPort: string
    mongoDatabase: string
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

  getVariables (): EnvironmentVariables {
    return {
      lifxToken: process.env.LIFX_TOKEN || '',
      mongoDatabase: process.env.MONGODB_DATABASE || '',
      mongoHost: process.env.MONGODB_HOST || '127.0.0.1',
      mongoPassword: process.env.MONGODB_PASSWORD || '',
      mongoPort: process.env.MONGODB_PORT || '27017',
      mongoUser: process.env.MONGODB_USER || '',
      tplinkPassword: process.env.TPLINK_PASSWORD || '',
      tplinkUser: process.env.TPLINK_USER || ''
    }
  }
}
