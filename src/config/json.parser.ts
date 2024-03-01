import ajv from 'ajv'
import errors, { HttpStatusError } from '../utils/errors'
import { Err, Ok, Result } from '../utils/result'
import { Model } from '../types/model'
import { SchemaModel } from '../types/schema.model'

const Ajv = new ajv({
  allErrors: true,
  async: true
})

const getSchema = async (model: Model): Promise<Result<SchemaModel, HttpStatusError>> => {
  const jsonSchema = await model.schema()
  let jsonSchemeObj: SchemaModel
  if (!jsonSchema) {
    if (!model.fallbackSchema) return Err(errors.validationError('Schema invalid or not found for key: ' + model.key))
    jsonSchemeObj = model.fallbackSchema
  } else {
    jsonSchemeObj = JSON.parse(jsonSchema)
  }
  return Ok(jsonSchemeObj)
}

const validate = async (json: unknown, model: Model): Promise<Result<boolean, HttpStatusError>> => {
  const jsonSchemeObj = await getSchema(model)
  const validate = Ajv.compile(jsonSchemeObj)
  const valid = await validate(json)
  if (!valid) {
    return Err(errors.validationError(validate.errors))
  }
  return Ok(true)
}

const jsonParser = {
  getSchema,
  validate
}

export default jsonParser
