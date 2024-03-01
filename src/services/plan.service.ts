import { Request, Response } from 'express'
import database from '../config/database'
import PlanModel from '../models/plan.model'
import jsonParser from '../config/json.parser'
import { Plan } from '../types/plan.model'
import eTag from 'etag'
import saveDataToRedis from './redis.service'

const redisDatabase = database.getDatabaseConnection()
const ALL_VALUES = '*'
const ETAG_CONSTANT = 'eTag'
const ROOT_CONSTANT = 'ROOT'

const trimDoubleQuotes = (str: string) => {
  return str.replace(/^"(.*)"$/, '$1')
}

const savePlanToRedis = async (plan: Plan, redisKey: string): Promise<[Plan, string]> => {
  await saveDataToRedis(plan, PlanModel)
  return [plan, trimDoubleQuotes(eTag(redisKey))]
  // const stringifiedPlan = JSON.stringify(plan)
  // const jsonEtag = eTag(stringifiedPlan)
  // const etag = trimDoubleQuotes(jsonEtag)
  // await redisDatabase.hSet(redisKey, ROOT_CONSTANT, stringifiedPlan)
  // await redisDatabase.hSet(redisKey, ETAG_CONSTANT, etag)
  // const planFromRedis = await redisDatabase.hGet(redisKey, ROOT_CONSTANT)
  // if (!planFromRedis) throw new Error('Failed to save plan to Redis')
  // return [JSON.parse(planFromRedis), etag]
}

const doesKeyExist = async (key: string) => {
  const exists = await redisDatabase.exists(key)
  return exists === 1
}

const getPlans = async (_: Request, res: Response) => {
  try {
    const keys = await redisDatabase.keys(PlanModel.key + '_' + ALL_VALUES)
    if (!keys || Object.keys(keys).length === 0) {
      res.removeHeader('ETag')
      res.status(200).json([])
      return
    }
    const values = keys.map(async (eachKey): Promise<string | null> => {
      const val = await redisDatabase.hGet(eachKey, ROOT_CONSTANT)
      return val === undefined ? undefined : JSON.parse(val)
    })
    const data = await Promise.all(values)
    const results = data.filter((each) => each !== null)
    res.removeHeader('ETag')
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = req.body as Plan
    if (!plan) {
      res.status(400).json({ error: 'Missing plan in body' })
      return
    }
    const result = await jsonParser.validate(plan, PlanModel)
    if (!result.ok) {
      res.status(400).json({ error: 'Schema not valid.', errors: result.error.messageObject })
      return
    }
    const redisKey = `${PlanModel.key}_${plan.objectId}`
    const keyExists = await doesKeyExist(redisKey)
    if (keyExists) {
      res.status(400).json({ error: 'Plan already exists' })
      return
    }

    const [savedPlan, eTag] = await savePlanToRedis(plan, redisKey)
    res.status(201).setHeader('ETag', eTag).json(savedPlan)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getPlanById = async (req: Request, res: Response) => {
  try {
    const { objectId } = req.params
    if (!objectId || objectId === '' || objectId === '{}') {
      res.status(400).json({ error: 'Missing objectId' })
      return
    }

    const redisKey = `${PlanModel.key}_${objectId}`
    const keyExists = await doesKeyExist(redisKey)
    if (!keyExists) {
      res.status(404).json({ error: `Object id doesn't exist` })
      return
    }

    const eTag = await redisDatabase.hGet(redisKey, ETAG_CONSTANT)

    const etagFromHeader = req.header('If-None-Match')
    if (etagFromHeader && etagFromHeader === eTag) {
      res.status(304).setHeader('ETag', eTag).send()
      return
    }

    const plan = await redisDatabase.hGet(redisKey, ROOT_CONSTANT)
    if (!plan) throw new Error('Failed to retrieve object from Redis')
    res.status(200).setHeader('ETag', eTag!).json(JSON.parse(plan))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updatePlan = async () => {
  throw new Error('Not implemented')
}

const deletePlan = async (req: Request, res: Response) => {
  try {
    const { objectId } = req.params
    if (!objectId || objectId === '' || objectId === '{}') {
      res.status(400).json({ error: 'Missing objectId' })
      return
    }

    const redisKey = `${PlanModel.key}_${objectId}`
    const keyExists = await doesKeyExist(redisKey)
    if (!keyExists) {
      res.status(404).json({ error: `Object id doesn't exist` })
      return
    }

    const deleted = await redisDatabase.del(redisKey)
    if (deleted === 0) throw new Error('Failed to delete object from Redis')
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const planService = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
}

export default planService
