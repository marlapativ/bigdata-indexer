import database, { IDatabase } from '../config/database'
import logger from '../config/logger'

interface IHealthCheckService {
  databaseHealthCheck(): Promise<boolean>
}

class HealthCheckService implements IHealthCheckService {
  private _database: IDatabase

  constructor(database: IDatabase) {
    this._database = database
  }

  async databaseHealthCheck(): Promise<boolean> {
    try {
      await this._database.getDatabaseConnection().authenticate()
      return true
    } catch {
      logger.error('Database health check failed')
      return false
    }
  }
}

const healthCheckService: IHealthCheckService = new HealthCheckService(database)

export default healthCheckService
