import chai from 'chai'
import chaiHTTP from 'chai-http'
import server from '../../src/server'
import { createDefaultUsers, createOrUpdateTestUser } from '../utils/user-utils'
import database from '../../src/config/database'
import User from '../../src/models/user.model'

chai.should()
chai.use(chaiHTTP)

const INTEGRATION_USER_AUTH_HEADER = 'Basic aW50ZWdyYXRpb25AdGVzdC5jb206cGFzc3dvcmQ='
const INTEGRATION_USER_WRONGPASS_AUTH_HEADER = 'Basic aW50ZWdyYXRpb25AdGVzdC5jb206d3JvbmdwYXNzd29yZA=='
const TEST_USER_AUTH_HEADER = 'Basic dGVzdEB0ZXN0LmNvbTpwYXNzd29yZA=='
const NO_USER_AUTH_HEADER = 'Basic YXNidjphc2RqaW8='

describe('User Controller Tests - /user', function () {
  // Setup the database connection before all tests
  this.beforeAll(async () => {
    await User.sync()
    await database.syncDatabase()
  })

  this.beforeEach(async () => {
    await createDefaultUsers()
  })

  it('should return status 405 on /user GET', function (done) {
    chai
      .request(server)
      .get('/v1/user')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 405 on /user PUT', function (done) {
    chai
      .request(server)
      .put('/v1/user')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 405 on /user DELETE', function (done) {
    chai
      .request(server)
      .delete('/v1/user')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 405 on /user PATCH', function (done) {
    chai
      .request(server)
      .patch('/v1/user')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 400 on /user POST with no body', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .send('')
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Request body cannot be empty')
        done()
      })
  })

  it('should return status 400 on /user POST with empty JSON', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .send({})
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Request body cannot be empty')
        done()
      })
  })

  it('should return status 400 on /user POST invalid JSON', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send('{"first_name"')
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 400 on /user POST invalid data', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('last_name is required and should be a string')
        done()
      })
  })

  it('should return status 400 on /user POST invalid username', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: 'TJ',
        password: 'TJ'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('username is not a valid email address')
        done()
      })
  })

  it('should return status 400 on /user POST invalid password 1', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: 'tj@tj.com',
        password: 'pass'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai
          .expect(res.body)
          .to.have.property('error')
          .eql('password should be at least 8 and at most 50 characters long')
        done()
      })
  })

  it('should return status 400 on /user POST invalid password 2', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: 'tj@tj.com',
        password: 'pass'.repeat(20)
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai
          .expect(res.body)
          .to.have.property('error')
          .eql('password should be at least 8 and at most 50 characters long')
        done()
      })
  })

  it('should return status 400 on /user POST invalid first_name max length', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'LENGTHMORETHAN100'.repeat(20),
        last_name: 'TJ',
        username: 'tj@tj.com',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai
          .expect(res.body)
          .to.have.property('error')
          .eql('first_name and last_name should be at most 100 characters long')
        done()
      })
  })

  it('should return status 400 on /user POST invalid field account_created', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'LENGTHMORETHAN100',
        last_name: 'TJ',
        username: 'tj@tj.com',
        password: 'password',
        account_created: new Date().toString()
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Field account_created cannot be set during user creation')
        done()
      })
  })

  it('should return status 400 on /user POST invalid data', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: '',
        last_name: 'TJ',
        username: 'a@a.com',
        password: 'TJ'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('first_name is required and should be a string')
        done()
      })
  })

  it('should return status 400 on /user POST duplicate user', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: 'test@test.com',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('User with this username already exists')
        done()
      })
  })

  it('should return status 400 on /user POST query params', function (done) {
    chai
      .request(server)
      .post('/v1/user?query')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: 'test@test.com',
        password: 'TJ'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Query parameters are not allowed')
        done()
      })
  })

  it('should return status 400 on /user POST with id', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        id: '123',
        first_name: 'TJ',
        last_name: 'TJ',
        username: Date.now() + 'test@test.com',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('id is not allowed')
        done()
      })
  })

  it('should return status 201 on /user POST', function (done) {
    chai
      .request(server)
      .post('/v1/user')
      .set('Content-Type', 'application/json')
      .send({
        first_name: 'TJ',
        last_name: 'TJ',
        username: Date.now() + 'test@test.com',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(201)
        const response = res.body
        chai.expect(response.first_name).to.eql('TJ')
        chai.expect(response.last_name).to.eql('TJ')
        chai.expect(response.username).to.contain('test@test.com')
        chai.expect(response).to.not.have.property('password')
        chai
          .expect(response)
          .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
        const createdDate = new Date(res.body.account_created)
        const updatedDate = new Date(res.body.account_updated)
        chai.expect(createdDate.getTime()).to.be.closeTo(new Date().getTime(), 1000)
        chai.expect(updatedDate.getTime()).to.be.closeTo(createdDate.getTime(), 100)
        done()
      })
  })

  after(() => chai.request(server).close())
})

describe('User Controller Tests - /self', function () {
  // Setup the database connection before all tests
  this.beforeAll(async () => {
    await database.getDatabaseConnection().sync()
  })

  // Create users before each test
  this.beforeEach(async () => {
    await createDefaultUsers()
  })

  it('should return status 405 on /user/self POST', function (done) {
    chai
      .request(server)
      .post('/v1/user/self')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 405 on /user/self PATCH', function (done) {
    chai
      .request(server)
      .patch('/v1/user/self')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 405 on /user/self DELETE', function (done) {
    chai
      .request(server)
      .delete('/v1/user/self')
      .end(function (_, res) {
        res.should.have.status(405)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 401 on /user/self GET without auth', function (done) {
    chai
      .request(server)
      .get('/v1/user/self')
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 401 on /user/self GET with query params', function (done) {
    chai
      .request(server)
      .get('/v1/user/self?qwuer')
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 401 on /user/self PUT without auth', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 401 on /user/self PUT with query params', function (done) {
    chai
      .request(server)
      .put('/v1/user/self?qwuer')
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 200 on /user/self GET', function (done) {
    chai
      .request(server)
      .get('/v1/user/self')
      .set('AUTHORIZATION', INTEGRATION_USER_AUTH_HEADER)
      .end(function (_, res) {
        res.should.have.status(200)
        const response = res.body
        chai.expect(response.first_name).to.eql('TJ')
        chai.expect(response.last_name).to.eql('M')
        chai.expect(response.username).to.contain('integration@test.com')
        chai.expect(response).to.not.have.property('password')
        chai
          .expect(response)
          .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
        done()
      })
  })

  it('should return status 400 on /user/self GET with query params', function (done) {
    chai
      .request(server)
      .get('/v1/user/self?qwuer')
      .set('AUTHORIZATION', INTEGRATION_USER_AUTH_HEADER)
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.be.have.property('error').eql('Query parameters are not allowed')
        done()
      })
  })

  it('should return status 400 on /user/self GET with body', function (done) {
    chai
      .request(server)
      .get('/v1/user/self')
      .set('AUTHORIZATION', INTEGRATION_USER_AUTH_HEADER)
      .send({ id: 'TJ' })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.be.have.property('error').eql('Request body should be empty')
        done()
      })
  })

  it('should return status 400 on /user/self GET with no user in db', function (done) {
    chai
      .request(server)
      .get('/v1/user/self')
      .set('AUTHORIZATION', NO_USER_AUTH_HEADER)
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 400 on /user/self GET with wrong pass', function (done) {
    chai
      .request(server)
      .get('/v1/user/self')
      .set('AUTHORIZATION', INTEGRATION_USER_WRONGPASS_AUTH_HEADER)
      .end(function (_, res) {
        res.should.have.status(401)
        chai.expect(res.body).to.be.empty
        done()
      })
  })

  it('should return status 400 on /user/self PUT send username', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: 'PUT',
        last_name: 'PUT',
        username: 'test@test.com',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Field username cannot be updated')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send empty fields 1', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: 'PUT',
        last_name: '',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('last_name cannot be empty and should be a string')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send empty body', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({})
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Request body cannot be empty')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send empty fields 2', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: '',
        last_name: 'PUT',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('first_name cannot be empty and should be a string')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send empty fields 3', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: 'A',
        last_name: 'B',
        password: ''
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('password cannot be empty and should be a string')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send id', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        id: '12',
        first_name: '',
        last_name: 'PUT',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('Field id cannot be updated')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send invalid first_name', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: 'VERYLONGNAME100'.repeat(20),
        last_name: 'PUT',
        password: 'password'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai.expect(res.body).to.have.property('error').eql('first_name should be at most 100 characters long')
        done()
      })
  })

  it('should return status 400 on /user/self PUT send invalid password', function (done) {
    chai
      .request(server)
      .put('/v1/user/self')
      .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
      .send({
        first_name: 'TESTTT',
        last_name: 'PUT',
        password: 'pass'
      })
      .end(function (_, res) {
        res.should.have.status(400)
        chai
          .expect(res.body)
          .to.have.property('error')
          .eql('Password should be at least 8 and at most 50 characters long')
        done()
      })
  })

  describe('User Controller Tests - /self PUT', function () {
    this.beforeEach(async () => {
      await createOrUpdateTestUser()
    })

    it('should return status 200 on /user/self PUT', function (done) {
      chai
        .request(server)
        .put('/v1/user/self')
        .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
        .send({
          first_name: 'PUT Update',
          last_name: 'PUT',
          password: 'password'
        })
        .end(function (_, res) {
          res.should.have.status(200)
          const response = res.body
          chai.expect(response.first_name).to.eql('PUT Update')
          chai.expect(response.last_name).to.eql('PUT')
          chai.expect(response.username).to.contain('test@test.com')
          chai.expect(response).to.not.have.property('password')
          chai
            .expect(response)
            .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
          const createdDate = new Date(res.body.account_created)
          const updatedDate = new Date(res.body.account_updated)
          chai.expect(updatedDate).to.be.greaterThan(createdDate)
          done()
        })
    })

    it('should return status 200 on /user/self PUT partial update 1', function (done) {
      chai
        .request(server)
        .put('/v1/user/self')
        .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
        .send({
          first_name: 'PUT Update Partial'
        })
        .end(function (_, res) {
          res.should.have.status(200)
          const response = res.body
          chai.expect(response.first_name).to.eql('PUT Update Partial')
          chai.expect(response.last_name).to.eql('M')
          chai.expect(response.username).to.contain('test@test.com')
          chai.expect(response).to.not.have.property('password')
          chai
            .expect(response)
            .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
          const createdDate = new Date(res.body.account_created)
          const updatedDate = new Date(res.body.account_updated)
          chai.expect(updatedDate).to.be.greaterThan(createdDate)
          done()
        })
    })

    it('should return status 200 on /user/self PUT partial update 2', function (done) {
      chai
        .request(server)
        .put('/v1/user/self')
        .set('AUTHORIZATION', TEST_USER_AUTH_HEADER)
        .send({
          last_name: 'PUT Update Partial last_name'
        })
        .end(function (_, res) {
          res.should.have.status(200)
          const response = res.body
          chai.expect(response.first_name).to.eql('TJ')
          chai.expect(response.last_name).to.eql('PUT Update Partial last_name')
          chai.expect(response.username).to.contain('test@test.com')
          chai.expect(response).to.not.have.property('password')
          chai
            .expect(response)
            .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
          const createdDate = new Date(res.body.account_created)
          const updatedDate = new Date(res.body.account_updated)
          chai.expect(updatedDate).to.be.greaterThan(createdDate)
          done()
        })
    })

    it('should return status 200 on /user/self PUT partial update password', async () => {
      const new_user = 'usertest@usertest.com'
      const password = 'password'
      const new_user_password = 'updatedpassword'
      const OLD_PASSWORD_AUTH_HEADER = `Basic ${Buffer.from(`${new_user}:${password}`).toString('base64')}`
      const NEW_PASSWORD_AUTH_HEADER = `Basic ${Buffer.from(`${new_user}:${new_user_password}`).toString('base64')}`
      await createOrUpdateTestUser(new_user)
      chai
        .request(server)
        .put('/v1/user/self')
        .set('AUTHORIZATION', OLD_PASSWORD_AUTH_HEADER)
        .send({
          password: new_user_password
        })
        .then((res) => {
          res.should.have.status(200)
          const response = res.body
          chai.expect(response.username).to.eql(new_user)
          chai.expect(response).to.not.have.property('password')
        })
        .then(function () {
          // Old password auth header should be unauthorized
          chai
            .request(server)
            .get('/v1/user/self')
            .set('AUTHORIZATION', OLD_PASSWORD_AUTH_HEADER)
            .end(function (_, res) {
              res.should.have.status(401)
            })

          // New password auth header should have access
          chai
            .request(server)
            .get('/v1/user/self')
            .set('AUTHORIZATION', NEW_PASSWORD_AUTH_HEADER)
            .end(function (_, res) {
              const response = res.body
              res.should.have.status(200)
              chai.expect(response.username).to.eql(new_user)
              chai.expect(response).to.not.have.property('password')
              chai.expect(response.first_name).to.eql('TJ')
              chai.expect(response.last_name).to.eql('M')
              chai
                .expect(response)
                .to.have.all.keys(['id', 'first_name', 'last_name', 'username', 'account_updated', 'account_created'])
              const createdDate = new Date(res.body.account_created)
              const updatedDate = new Date(res.body.account_updated)
              chai.expect(updatedDate).to.be.greaterThan(createdDate)
            })
        })
    })
  })

  this.afterAll(() => chai.request(server).close())
})
