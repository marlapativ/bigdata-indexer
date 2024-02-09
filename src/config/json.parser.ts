import ajv from 'ajv'
import errors from '../utils/errors'
import { Err, Ok, Result } from '../utils/result'
import { Model } from '../types/model'

const Ajv = new ajv({
  allErrors: true
})

const validate = async (json: unknown, model: Model): Promise<Result<boolean, Error>> => {
  const jsonSchema = await model.schema
  if (!jsonSchema || JSON.parse(jsonSchema).length === 0) {
    return Err(errors.validationError('Schema invalid or not found for key: ' + model.key))
  }
  const validate = Ajv.compile(JSON.parse(jsonSchema))
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
