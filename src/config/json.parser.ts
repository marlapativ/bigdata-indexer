import ajv from 'ajv'
import errors from '../utils/errors'
import { Err, Ok, Result } from '../utils/result'

const Ajv = new ajv({
  allErrors: true
})

const validate = (json: unknown, schema: object): Result<boolean, Error> => {
  const validate = Ajv.compile(schema)
  const valid = validate(json)
  if (!valid) {
    const allErrors = validate.errors!.map((error) => error.message!)
    return Err(errors.validationError(allErrors))
  }
  return Ok(true)
}

const jsonParser = {
  validate
}

export default jsonParser
