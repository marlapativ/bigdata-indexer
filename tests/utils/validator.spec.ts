import chai from 'chai'
import validator from '../../src/utils/validator'

chai.should()

describe('Validator Tests', function () {
  it('should return true when data is null', () => {
    validator.isNullOrUndefined(null).should.be.true
  })

  it('should return true when data is undefined', () => {
    validator.isNullOrUndefined(undefined).should.be.true
  })

  it('should return false when data is not null or undefined', () => {
    validator.isNullOrUndefined({}).should.be.false
    validator.isNullOrUndefined('').should.be.false
    validator.isNullOrUndefined(123).should.be.false
  })
})
