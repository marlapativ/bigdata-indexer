/* eslint-disable @typescript-eslint/no-explicit-any */
import jsonParser from '../config/json.parser'
import { Model } from '../types/model'
import { ArraySchema, ObjectSchema, SchemaTypeEnum } from '../types/schema.model'

const saveDataToRedis = async (data: any, model: Model) => {
  const schema = await jsonParser.getSchema(model)
  if (!schema.ok) throw schema.error
  else {
    const schemaModel = schema.value
    switch (schemaModel.type) {
      case SchemaTypeEnum.OBJECT:
        return saveObjectDataToRedis(data, schemaModel)
      case SchemaTypeEnum.ARRAY:
        return saveArrayDataToRedis(data, schemaModel)
    }
  }
}

const saveObjectDataToRedis = async (data: any, model: ObjectSchema) => {
  console.table([data, model])
  // for (const [key, value] of Object.entries(data)) {
  //   // await saveDataToRedis(value, model.properties[key])
  //   console.table([key, value, model])
  // }
}

const saveArrayDataToRedis = async (data: any, model: ArraySchema) => {
  console.table([data, model])
}

export default saveDataToRedis
