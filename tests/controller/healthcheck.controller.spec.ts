import chai from 'chai'
import chaiHTTP from 'chai-http'
import server from '../../src/server'
import database from '../../src/config/database'
import { TEST_DB_CONNECTION_STRING, TEST_DB_NOT_EXIST_CONNECTION_STRING } from '../utils/env-utils'

chai.should()
chai.use(chaiHTTP)

describe('Health Check Controller Tests', function () {
  it('should return status 503 on /healthz GET', function (done) {
    // Mocking invalid data connection
    database.updateConnectionString(TEST_DB_NOT_EXIST_CONNECTION_STRING)

    chai
      .request(server)
      .get('/healthz')
      .end(function (_, res) {
        res.should.have.status(503)
        done()
      })
  })

  it('should return status 200 on /healthz GET', function (done) {
    database.updateConnectionString(TEST_DB_CONNECTION_STRING)

    chai
      .request(server)
      .get('/healthz')
      .end(function (_, res) {
        res.should.have.status(200)
        res.should.have.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        res.should.have.header('Pragma', 'no-cache')
        res.should.have.header('X-Content-Type-Options', 'nosniff')
        done()
      })
  })

  it('should return status 405 on /healthz POST', function (done) {
    chai
      .request(server)
      .post('/healthz')
      .end(function (_, res) {
        res.should.have.status(405)
        done()
      })
  })

  it('should return status 400 on /healthz GET with query params', function (done) {
    chai
      .request(server)
      .get('/healthz?q')
      .end(function (_, res) {
        res.should.have.status(400)
        done()
      })
  })

  it('should return status 400 on /healthz GET with query params 2', function (done) {
    chai
      .request(server)
      .get('/healthz?q=2')
      .end(function (_, res) {
        res.should.have.status(400)
        done()
      })
  })

  it('should return status 400 on /healthz GET with body', function (done) {
    chai
      .request(server)
      .get('/healthz')
      .send('test-body')
      .end(function (_, res) {
        res.should.have.status(400)
        done()
      })
  })

  it('should return status 400 on /healthz GET with json body', function (done) {
    chai
      .request(server)
      .get('/healthz')
      .set('content-type', 'application/json')
      .send({ myparam: 'test' })
      .end(function (_, res) {
        res.should.have.status(400)
        done()
      })
  })

  it('should return status 404 on / GET', function (done) {
    chai
      .request(server)
      .get('/')
      .end(function (_, res) {
        res.should.have.status(404)
        done()
      })
  })

  after(() => {
    database.updateConnectionString(TEST_DB_CONNECTION_STRING)
  })

  this.afterAll(() => {
    database.updateConnectionString(TEST_DB_CONNECTION_STRING)
    chai.request(server).close()
  })
})
