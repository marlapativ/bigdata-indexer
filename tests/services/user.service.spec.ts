import chai from 'chai'
import { IUserService, UserService } from '../../src/services/user.service'
import crypto, { ICrypto } from '../../src/config/crypto'
import User from '../../src/models/user.model'
import httpContext, { IContext } from '../../src/config/context'

chai.should()
const mockCrypto: ICrypto = {
  hashPassword: async (password: string) => {
    throw new Error('Error hashing password ' + password)
  },
  comparePassword: async (password: string, hashedPassword: string) => {
    throw new Error('Error comparing password' + password + ' ' + hashedPassword)
  }
}

const mockContext: IContext = {
  getUserIdFromContext: () => {
    throw new Error('Error from context')
  },
  setUserIdInContext: (userId: string) => {
    throw new Error('Error from context: ' + userId)
  }
}

describe('User Service Tests', function () {
  let userService: IUserService

  this.beforeEach(() => {
    userService = new UserService(crypto, httpContext)
  })

  it('should return validation on user exists', async () => {
    const user = {
      first_name: 'John',
      last_name: 'Doe',
      username: 'email@email.com',
      password: 'password'
    } as User
    await userService.createUser(user)
    const result = await userService.createUser(user)
    result.ok.should.be.false
    !result.ok && result.error.message.should.equal('User with this username already exists')
  })

  it('should return internal server error on createUser on failure of component', async () => {
    const user = {
      first_name: 'John',
      last_name: 'Doe',
      username: Date.now() + 'email@email.com',
      password: 'password'
    } as User

    userService = new UserService(mockCrypto, mockContext)
    const result = await userService.createUser(user)
    result.ok.should.be.false
    !result.ok && result.error.message.should.equal('Error creating user: Error: Error hashing password password')
  })

  it('should return user not found on updateUser on no http context', async () => {
    const user = {
      first_name: 'John',
      last_name: 'Doe',
      password: 'password'
    } as User

    userService = new UserService(mockCrypto, httpContext)
    const result = await userService.updateUser(user)
    result.ok.should.be.false
    !result.ok && result.error.message.should.equal('User not found')
  })

  it('should return internal server error on updateUser on failure of component', async () => {
    const updateUser = {
      first_name: 'John',
      last_name: 'Doe',
      password: 'password'
    } as User
    userService = new UserService(mockCrypto, mockContext)
    const result = await userService.updateUser(updateUser)
    result.ok.should.be.false
    !result.ok && result.error.message.should.equal('Error updating user: Error: Error from context')
  })

  it('should return internal server error on getUser on failure of component', async () => {
    userService = new UserService(mockCrypto, mockContext)
    const result = await userService.getUser()
    result.ok.should.be.false
    !result.ok && result.error.message.should.equal('Error fetching user: Error: Error from context')
  })
})
