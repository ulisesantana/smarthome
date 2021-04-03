import { Collection, FilterQuery, MongoClient, MongoError } from 'mongodb'
import { inject, injectable } from 'tsyringe'
import { Environment } from '../../environment'

export interface DatabaseResponse {
  ok: boolean
  data?: any
  error?: any
}

export interface MongoAPI {
    upsertOne: <T> (filter: FilterQuery<T>, entity: Partial<T>) => Promise<T>
    findOne: <T> (filter: FilterQuery<T>) => Promise<T>
    find: <T> (filter: FilterQuery<T>) => Promise<T[]>
    aggregate: <T> (pipeline: object[]) => Promise<T>
    remove: <T> (filter: FilterQuery<T>) => Promise<void>
    removeCollection: () => Promise<void>
}

@injectable()
export class MongoDB {
  private instance: MongoClient

  constructor (@inject(Environment) private readonly environment: Environment) {
    this.instance = this.getClient()
  }

  useCollection (collectionName: string): MongoAPI {
    return {
      upsertOne: async <T> (filter: FilterQuery<T>, entity: Partial<T>): Promise<T> => {
        const result = await this.on(() =>
          this.getCollection(collectionName).findOneAndUpdate(filter, { $set: entity }, { upsert: true })
        )
        if (result.ok) {
          return { ...result.data.value, ...entity }
        } else {
          throw new MongoError(result.error)
        }
      },

      findOne: async <T> (filter: FilterQuery<T>): Promise<T> => {
        const result = await this.on(() => this.getCollection(collectionName).findOne(filter))
        if (result.ok) {
          return result.data || {} as T
        } else {
          throw new MongoError(result.error)
        }
      },

      find: async <T> (filter: FilterQuery<T>): Promise<T[]> => {
        const result = await this.on(() => this.getCollection(collectionName).find(filter).toArray())
        if (result.ok) {
          return result.data || [] as T[]
        } else {
          throw new MongoError(result.error)
        }
      },

      aggregate: async <T> (pipeline: object[]): Promise<T> => {
        const result = await this.on(() => this.getCollection(collectionName).aggregate(pipeline).toArray())
        if (result.ok) {
          return result.data || [] as T[]
        } else {
          throw new MongoError(result.error)
        }
      },

      remove: async <T> (filter: FilterQuery<T>): Promise<void> => {
        const result = await this.on(() => this.getCollection(collectionName).deleteOne(filter))
        if (!result.ok) {
          throw new MongoError(result.error)
        }
      },

      removeCollection: async (): Promise<void> => {
        if (this.environment.isTest()) {
          await this.on(() => this.getCollection(collectionName).drop())
        }
      }
    }
  }

  private getCollection (collection: string): Collection {
    return this.instance.db(process.env.mongodb_database).collection(collection)
  }

  private async on (callback: () => Promise<any>): Promise<DatabaseResponse> {
    let data: any
    try {
      await this.connect()
      data = await callback()
      await this.close()
      return { ok: true, data }
    } catch (error) {
      await this.close()
      return { ok: false, error }
    }
  }

  private async connect (): Promise<void> {
    if (!this.instance.isConnected()) {
      await this.instance.connect()
    }
  }

  private async close (): Promise<void> {
    if (this.instance.isConnected()) {
      await this.instance.close()
      this.instance = this.getClient()
    }
  }

  private getClient () {
    const {
      mongoDatabase,
      mongoHost,
      mongoPassword,
      mongoPort,
      mongoUser
    } = this.environment.getVariables()

    if (this.environment.isProduction()) {
      if (!mongoUser) {
        throw new Error('Missing user for MongoDB connection')
      }
      if (!mongoPassword) {
        throw new Error('Missing password for MongoDB connection')
      }
      if (!mongoDatabase) {
        throw new Error('Missing database for MongoDB connection')
      }
    }

    const mongoUri = `mongodb://${
      mongoUser
    }:${
      mongoPassword
    }@${
      mongoHost
    }:${
      mongoPort
    }/${
      mongoDatabase
    }`
    return new MongoClient(mongoUri, {
      useUnifiedTopology: true
    })
  }
}
