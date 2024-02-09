import chai from 'chai'
import healthCheckService from '../../src/services/healthcheck.service'

chai.should()

describe('Health Check Service Tests', function () {
  it('should not throw error for database health check', async () => {
    try {
      await healthCheckService.databaseHealthCheck()
    } catch (e) {
      chai.assert.fail(e)
    }
  })
})
