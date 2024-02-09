import { Request, Response } from 'express'
import database from '../config/database'
import PlanModel from '../models/plan.model'
import jsonParser from '../config/json.parser'
import { Plan } from '../types/plan.model'
import eTag from 'etag'

const redisDatabase = database.getDatabaseConnection()
const ALL_VALUES = '*'
const ETAG_CONSTANT = 'eTag'

const savePlanToRedis = async (plan: Plan, redisKey: string): Promise<[Plan, string]> => {
  const stringifiedPlan = JSON.stringify(plan)
  const etag = eTag(stringifiedPlan)
  await redisDatabase.set(redisKey, stringifiedPlan)
  await redisDatabase.hSet(redisKey, ETAG_CONSTANT, etag)
  const planFromRedis = await redisDatabase.get(redisKey)
  if (!planFromRedis) throw new Error('Failed to save plan to Redis')
  return [JSON.parse(planFromRedis), etag]
}

const doesKeyExist = async (key: string) => {
  const exists = await redisDatabase.exists(key)
  return exists === 1
}

const getPlans = async (_: Request, res: Response) => {
  try {
    const plans = await redisDatabase.hGetAll(PlanModel.key + '_' + ALL_VALUES)
    if (!plans || Object.keys(plans).length === 0) {
      res.status(404).json({ error: 'No plans found' })
      return
    }
    const results = Object.values(plans).map((plan) => JSON.parse(plan))
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = req.body as Plan
    if (!plan) {
      res.status(400).json({ error: 'Missing plan' })
      return
    }
    const result = await jsonParser.validate(plan, PlanModel)
    if (!result.ok) {
      res.status(400).json({ error: 'Schema not valid: \n' + result.error.message })
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
    const { planId } = req.params
    if (!planId || planId === '' || planId === '{}') {
      res.status(400).json({ error: 'Missing planId' })
      return
    }

    const redisKey = `${PlanModel.key}_${planId}`
    const keyExists = await doesKeyExist(redisKey)
    if (!keyExists) {
      res.status(404).json({ error: `Plan id doesn't exist` })
      return
    }

    const eTag = await redisDatabase.hGet(redisKey, ETAG_CONSTANT)

    const etagFromHeader = req.header('If-None-Match')
    if (etagFromHeader && etagFromHeader === eTag) {
      res.status(304).setHeader('ETag', eTag).send()
      return
    }

    const plan = await redisDatabase.get(redisKey)
    if (!plan) throw new Error('Failed to retrieve plan from Redis')
    res.status(200).setHeader('ETag', eTag!).json(JSON.parse(plan))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updatePlan = async () => {
  throw new Error('Not implemented')
}

const deletePlan = async () => {
  throw new Error('Not implemented')
}

const planService = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
}

export default planService
