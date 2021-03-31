import { Collection, FilterQuery, MongoClient, MongoError } from 'mongodb'

export interface DatabaseResponse {
  ok: boolean
  data?: any
  error?: any
}

export class MongoDB {
  private instance: MongoClient

  constructor (
    private readonly collection: string
  ) {
    this.instance = MongoDB.getClient()
  }

  async upsertOne<T> (filter: FilterQuery<T>, entity: Partial<T>): Promise<T> {
    const result = await this.on(() =>
      this.getCollection(this.collection).findOneAndUpdate(filter, { $set: entity }, { upsert: true })
    )
    if (result.ok) {
      return { ...result.data.value, ...entity }
    } else {
      throw new MongoError(result.error)
    }
  }

  async findOne<T> (filter: FilterQuery<T>): Promise<T> {
    const result = await this.on(() => this.getCollection(this.collection).findOne(filter))
    if (result.ok) {
      return result.data || {} as T
    } else {
      throw new MongoError(result.error)
    }
  }

  async find<T> (filter: FilterQuery<T>): Promise<T[]> {
    const result = await this.on(() => this.getCollection(this.collection).find(filter).toArray())
    if (result.ok) {
      return result.data || [] as T[]
    } else {
      throw new MongoError(result.error)
    }
  }

  async aggregate<T> (pipeline: object[]): Promise<T> {
    const result = await this.on(() => this.getCollection(this.collection).aggregate(pipeline).toArray())
    if (result.ok) {
      return result.data || [] as T[]
    } else {
      throw new MongoError(result.error)
    }
  }

  async remove<T> (filter: FilterQuery<T>): Promise<void> {
    const result = await this.on(() => this.getCollection(this.collection).deleteOne(filter))
    if (!result.ok) {
      throw new MongoError(result.error)
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
      this.instance = MongoDB.getClient()
    }
  }

  private static getClient () {
    const user: string = process.env.MONGODB_USER || ''
    const password: string = process.env.MONGODB_PASSWORD || ''
    const host: string = process.env.MONGODB_HOST || '127.0.0.1'
    const port: string = process.env.MONGODB_PORT || '27017'
    const database: string = process.env.MONGODB_DATABASE || ''

    if (process.env.NODE_ENV === 'production') {
      if (!user) {
        throw new Error('Missing user for MongoDB connection')
      }
      if (!password) {
        throw new Error('Missing password for MongoDB connection')
      }
      if (!database) {
        throw new Error('Missing database for MongoDB connection')
      }
    }

    const mongoUri = `mongodb://${user}:${password}@${host}:${port}/${database}`
    return new MongoClient(mongoUri, {
      useUnifiedTopology: true
    })
  }
}
