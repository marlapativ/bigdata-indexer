import { Options, Sequelize } from 'sequelize'
import * as pg from 'pg'
import env from './env'
import logger from './logger'

export interface IDatabase {
  getDatabaseConnection(): Sequelize
  closeDatabaseConnection(): Promise<void>
  syncDatabase(): Promise<boolean>
  updateConnectionString(connectionString?: string): void
}

class Database implements IDatabase {
  private _sequelize: Sequelize
  private _options: Options | undefined = undefined

  constructor() {
    this.updateConnectionString()
  }

  async syncDatabase(): Promise<boolean> {
    try {
      await this._sequelize.authenticate()
      await this._sequelize.sync()
      return true
    } catch (error) {
      logger.error(`Error while syncing database. Error: ${error}`)
      return false
    }
  }

  getDatabaseConnection(): Sequelize {
    return this._sequelize
  }

  closeDatabaseConnection(): Promise<void> {
    return this._sequelize.close()
  }

  updateConnectionString(connectionString?: string): void {
    connectionString ??= getConnectionString()
    this._options = getSequelizeOptions(connectionString)
    this._sequelize = new Sequelize(connectionString, this._options)
  }
}

const getSequelizeOptions = (connectionString: string): Options | undefined => {
  if (connectionString.includes('postgres://')) return { dialect: 'postgres', dialectModule: pg }
  return undefined
}

const getConnectionString = (): string => {
  const connectionString = env.getOrDefault('DB_CONN_STRING', '')
  if (connectionString !== '') return connectionString

  // Defaulting to Postgres connection string from env variables
  return getPostgresConnectionString()
}

const getPostgresConnectionString = (): string => {
  const host = env.getOrDefault('DB_HOST', 'localhost')
  const port = env.getOrDefault('DB_PORT', '5432')
  const user = env.getOrDefault('DB_USER', 'cloud')
  const password = env.getOrDefault('DB_PASSWORD', 'cloud')
  const dbname = env.getOrDefault('DB_NAME', 'Cloud')
  return `postgres://${user}:${password}@${host}:${port}/${dbname}`
}

env.loadEnv()
const database: IDatabase = new Database()
export default database
