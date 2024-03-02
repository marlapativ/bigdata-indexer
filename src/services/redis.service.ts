/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClientType } from 'redis'
import database from '../config/database'
import jsonParser from '../config/json.parser'
import { Model } from '../types/model'
import { ArraySchema, ObjectSchema, SchemaTypeEnum } from '../types/schema.model'
import errors, { HttpStatusError } from '../utils/errors'
import { Ok, Result } from '../utils/result'
import { IDatabase } from '../config/database'

const SEPERATOR = ':'
const ALL_VALUES = '*'
const ETAG_CONSTANT = 'eTag'

export interface IRedisService {
  doesKeyExist: (objectId: string) => Promise<boolean>
  save: (data: any) => Promise<Result<string, HttpStatusError>>
  get: (objectId: string) => Promise<Result<any, HttpStatusError>>
  getAll: () => Promise<any[]>
  delete: (objectId: string) => Promise<number>
  setEtag: (objectId: string, eTag: string) => Promise<void>
  getEtag: (objectId: string) => Promise<Result<string, HttpStatusError>>
}

class RedisService implements IRedisService {
  redisDatabase: RedisClientType
  model: Model

  constructor(database: IDatabase, model: Model) {
    this.redisDatabase = database.getDatabaseConnection()
    this.model = model
  }

  doesKeyExist = async (objectId: string) => {
    const redisKey = this._getKey(objectId)
    return await this._doesRedisKeyExists(redisKey)
  }

  save = async (data: any): Promise<Result<string, HttpStatusError>> => {
    const schema = await jsonParser.getSchema(this.model)
    if (!schema.ok) return schema
    else {
      const schemaModel = schema.value
      switch (schemaModel.type) {
        case SchemaTypeEnum.OBJECT:
          const objResult = await this._saveObjectDataToRedis(data, schemaModel)
          return Ok(objResult)
        case SchemaTypeEnum.ARRAY:
          const arrResult = await this._saveArrayDataToRedis(data, schemaModel)
          // In case of array, we join the array with a comma and return the keys
          return Ok(arrResult.join(','))
        default:
          return Ok('')
      }
    }
  }

  private _saveObjectDataToRedis = async (data: any, model: ObjectSchema): Promise<string> => {
    const redisKey = `${data['objectType']}${SEPERATOR}${data['objectId']}`
    const redisValue: Record<string, any> = {}
    for (const [key, subModel] of Object.entries(model.properties)) {
      if (data.hasOwnProperty(key)) {
        if (subModel.type === SchemaTypeEnum.OBJECT) {
          redisValue[key] = await this._saveObjectDataToRedis(data[key], subModel)
        } else if (subModel.type === SchemaTypeEnum.ARRAY) {
          redisValue[key] = await this._saveArrayDataToRedis(data[key], subModel)
        } else {
          redisValue[key] = data[key]
        }
      }
    }
    await this.redisDatabase.set(redisKey, JSON.stringify(redisValue))
    return redisKey
  }

  private _saveArrayDataToRedis = async (data: any, model: ArraySchema): Promise<string[]> => {
    const childrenType = model.items.type
    if (childrenType === SchemaTypeEnum.OBJECT) {
      const redisKeys: string[] = []
      if (!Array.isArray(data)) throw new Error('Data is not an array')
      for (let i = 0; i < data.length; i++) {
        const value = data[i]
        const redisKey = await this._saveObjectDataToRedis(value, model.items)
        redisKeys.push(redisKey)
      }
      return redisKeys
    } else if (childrenType === SchemaTypeEnum.ARRAY) {
      return this._saveArrayDataToRedis(data, model.items)
    }
    return []
  }

  get = async (objectId: string): Promise<Result<any, HttpStatusError>> => {
    const redisKey = this._getKey(objectId)
    const isKeyExists = await this._doesRedisKeyExists(redisKey)
    if (!isKeyExists) return errors.notFoundError('Key not found')
    const schema = await jsonParser.getSchema(this.model)
    if (!schema.ok) return schema
    else {
      const schemaModel = schema.value
      switch (schemaModel.type) {
        case SchemaTypeEnum.OBJECT:
          const objResult = await this._getObjectDataFromRedis(redisKey, schemaModel)
          return Ok(objResult)
        case SchemaTypeEnum.ARRAY:
          const keys = redisKey.split(',')
          const arrResult = await this._getArrayDataFromRedis(keys, schemaModel)
          return Ok(arrResult)
        default:
          return errors.validationError('Schema not valid')
      }
    }
  }

  private _getObjectDataFromRedis = async (redisKey: string, model: ObjectSchema): Promise<any> => {
    const redisValue = await this.redisDatabase.get(redisKey)
    if (!redisValue) return ''
    const value = JSON.parse(redisValue)
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(model.properties)) {
      if (val.type === SchemaTypeEnum.OBJECT) {
        result[key] = await this._getObjectDataFromRedis(value[key], val)
      } else if (val.type === SchemaTypeEnum.ARRAY) {
        result[key] = await this._getArrayDataFromRedis(value[key], val)
      } else {
        result[key] = value[key]
      }
    }
    return result
  }

  private _getArrayDataFromRedis = async (keys: string[], model: ArraySchema): Promise<any[]> => {
    const childrenType = model.items.type
    const result: any[] = []
    if (childrenType === SchemaTypeEnum.OBJECT) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i] as string
        const value = await this._getObjectDataFromRedis(key, model.items)
        result.push(value)
      }
    } else if (childrenType === SchemaTypeEnum.ARRAY) {
      const value = await this._getArrayDataFromRedis(keys, model.items)
      result.push(value)
    }
    return result
  }

  getAll = async (): Promise<string[]> => {
    const prefix = this._getKey('')
    const allPlanKeys = `${prefix}${ALL_VALUES}`
    const keys = await this.redisDatabase.keys(allPlanKeys)
    const values = keys.map(async (eachKey): Promise<string | null> => {
      const objectId = eachKey.replace(prefix, '')
      const val = await this.get(objectId)
      return val.ok ? val.value : null
    })
    const data = await Promise.all(values)
    const results: any[] = data.filter((each) => each !== null)
    return results
  }

  private _getKey = (objectId: string) => {
    return `${this.model.key}${SEPERATOR}${objectId}`
  }

  delete = async (objectId: string) => {
    const redisKey = this._getKey(objectId)
    return await this.redisDatabase.del(redisKey)
  }

  setEtag = async (objectId: string, eTag: string) => {
    const redisKey = this._getKey(objectId)
    await this.redisDatabase.set(`${ETAG_CONSTANT}${SEPERATOR}${redisKey}`, eTag)
  }

  getEtag = async (objectId: string) => {
    const redisKey = this._getKey(objectId)
    const eTagRedisKey = `${ETAG_CONSTANT}${SEPERATOR}${redisKey}`
    const doesKeyExist = await this._doesRedisKeyExists(eTagRedisKey)
    if (!doesKeyExist) return errors.notFoundError('ETag not found')
    const value = await this.redisDatabase.get(eTagRedisKey)
    return Ok(value as string)
  }

  private _doesRedisKeyExists = async (redisKey: string) => {
    const exists = await this.redisDatabase.exists(redisKey)
    return exists === 1
  }
}

const RedisServiceFactory = {
  create: (model: Model): IRedisService => {
    return new RedisService(database, model)
  }
}

export default RedisServiceFactory
