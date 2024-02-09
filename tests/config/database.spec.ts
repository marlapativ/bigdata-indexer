import chai from 'chai'
import database from '../../src/config/database'
import {
  TEST_DB_CONNECTION_STRING,
  TEST_DB_CONNECTION_STRING_VARIABLES,
  TEST_DB_ERROR_CONNECTION_STRING_VARIABLES,
  TEST_DB_NOT_EXIST_CONNECTION_STRING,
  TEST_DB_VARIABLES,
  resetEnvironmentVariables,
  setEnvironmentVariables
} from '../utils/env-utils'

chai.should()

describe('Database Tests', function () {
  this.beforeEach(() => {
    resetEnvironmentVariables(TEST_DB_CONNECTION_STRING_VARIABLES)
    resetEnvironmentVariables(TEST_DB_VARIABLES)
  })

  it('should throw error on invalid connection string', () => {
    // Arrange
    setEnvironmentVariables(TEST_DB_ERROR_CONNECTION_STRING_VARIABLES)

    // Act
    try {
      database.updateConnectionString()

      // Assert
      chai.assert.fail('Should have thrown error')
    } catch (_) {}
  })

  it('should throw error on invalid connection string sync', async () => {
    // Act
    try {
      database.updateConnectionString(TEST_DB_NOT_EXIST_CONNECTION_STRING)
      const result = await database.syncDatabase()
      chai.expect(result).equal(false)
    } catch (_) {
      // Assert
      chai.assert.fail('Should have thrown error')
    } finally {
      database.updateConnectionString()
    }
  })

  it('should have defaults for connection string', (done) => {
    // Act
    const sequelize = database.getDatabaseConnection()

    // Assert
    chai.expect(sequelize.config.host).equal('localhost')
    chai.expect(sequelize.config.port).equal('5432')
    sequelize.config.database.should.equal('Cloud')
    sequelize.config.username.should.equal('cloud')
    chai.expect(sequelize.config.password).equal('cloud')
    done()
  })

  it('should pick env variable DB_CONN_STRING for connection string', (done) => {
    // Arrange
    setEnvironmentVariables(TEST_DB_CONNECTION_STRING_VARIABLES)
    database.updateConnectionString()

    // Act
    const sequelize = database.getDatabaseConnection()

    // Assert
    chai.expect(sequelize.config.host).equal('localhost')
    chai.expect(sequelize.config.port).equal('5432')
    sequelize.config.database.should.equal('Test')
    sequelize.config.username.should.equal('test')
    chai.expect(sequelize.config.password).equal('test')
    done()
  })

  it('should pick env variables for connection string', (done) => {
    // Arrange
    setEnvironmentVariables(TEST_DB_VARIABLES)
    database.updateConnectionString()

    // Act
    const sequelize = database.getDatabaseConnection()

    // Assert
    chai.expect(sequelize.config.host).equal('localhost')
    chai.expect(sequelize.config.port).equal('5432')
    sequelize.config.database.should.equal('Cloud')
    sequelize.config.username.should.equal('cloud')
    chai.expect(sequelize.config.password).equal('cloud')
    done()
  })

  it('should priortize the env variable DB_CONN_STRING for connection string', (done) => {
    // Arrange
    setEnvironmentVariables(TEST_DB_CONNECTION_STRING_VARIABLES)
    setEnvironmentVariables(TEST_DB_VARIABLES)
    database.updateConnectionString()

    // Act
    const sequelize = database.getDatabaseConnection()

    // Assert
    chai.expect(sequelize.config.host).equal('localhost')
    chai.expect(sequelize.config.port).equal('5432')
    sequelize.config.database.should.equal('Test')
    sequelize.config.username.should.equal('test')
    done()
  })

  it('should successfully establish sequelize connection', async () => {
    // Arrange
    setEnvironmentVariables(TEST_DB_VARIABLES)
    database.updateConnectionString()

    // Act
    const sequelize = database.getDatabaseConnection()

    // Assert
    try {
      await sequelize.authenticate()
    } catch (err) {
      chai.assert.fail(err)
    }
  })

  it('should successfully close sequelize connection', async () => {
    // Arrange
    setEnvironmentVariables(TEST_DB_VARIABLES)
    database.updateConnectionString()

    // Act
    const sequelize = database.getDatabaseConnection()
    await sequelize.authenticate()

    // Assert
    try {
      await database.closeDatabaseConnection()
    } catch (err) {
      chai.assert.fail(err)
    }
  })

  this.afterAll(() => {
    resetEnvironmentVariables(TEST_DB_CONNECTION_STRING_VARIABLES)
    resetEnvironmentVariables(TEST_DB_VARIABLES)
    setEnvironmentVariables(TEST_DB_VARIABLES)
    database.updateConnectionString(TEST_DB_CONNECTION_STRING)
  })
})
