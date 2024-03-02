import { Request, Response } from 'express'
import eTag from 'etag'
import RedisServiceFactory from './redis.service'
import jsonParser from '../config/json.parser'
import PlanModel, { Plan } from '../models/plan.model'
import errors, { HttpStatusError } from '../utils/errors'
import { Ok, Result } from '../utils/result'
import { handleResponse } from '../utils/response'

const redisService = RedisServiceFactory.create(PlanModel)

const generateEtag = (stringifiedPlan: string | object) => {
  if (typeof stringifiedPlan === 'object') stringifiedPlan = JSON.stringify(stringifiedPlan)
  const jsonEtag = eTag(stringifiedPlan)
  const etag = jsonEtag.replace(/^"(.*)"$/, '$1')
  return etag
}

const savePlanToRedis = async (
  plan: Plan,
  isUpdate: boolean = false
): Promise<Result<[Plan, string], HttpStatusError>> => {
  const objectId = plan.objectId
  const keyExists = await redisService.doesKeyExist(objectId)
  if (isUpdate && !keyExists) return errors.validationError('Object does not exist')
  else if (!isUpdate && keyExists) return errors.validationError('Object already exists')

  const planRedisKey = await redisService.save(plan)
  if (!planRedisKey.ok) return planRedisKey

  const planFromRedis = await redisService.get(objectId)
  if (!planFromRedis.ok) return planFromRedis

  const eTagForPlan = generateEtag(planFromRedis.value)
  await redisService.setEtag(objectId, eTagForPlan)

  const result: [Plan, string] = [planFromRedis.value, eTagForPlan]
  return Ok(result)
}

const getPlans = async (_: Request, res: Response) => {
  try {
    const results = await redisService.getAll()
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
      return handleResponse(res, result)
    }

    const saveResult = await savePlanToRedis(plan)
    if (!saveResult.ok) {
      return handleResponse(res, saveResult)
    }
    const [savedPlan, eTag] = saveResult.value
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

    const keyExists = await redisService.doesKeyExist(objectId)
    if (!keyExists) {
      res.status(404).json({ error: `Object id doesn't exist` })
      return
    }

    const eTag = await redisService.getEtag(objectId)
    if (!eTag.ok) {
      return handleResponse(res, eTag)
    }

    const etagFromHeader = req.header('If-None-Match')
    if (etagFromHeader && etagFromHeader === eTag.value) {
      res.status(304).setHeader('ETag', eTag.value).send()
      return
    }

    const plan = await redisService.get(objectId)
    return handleResponse(res, plan)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = req.body as Plan
    if (!plan) {
      res.status(400).json({ error: 'Missing plan in body' })
      return
    }
    const result = await jsonParser.validate(plan, PlanModel)
    if (!result.ok) {
      return handleResponse(res, result)
    }

    const saveResult = await savePlanToRedis(plan, true)
    if (!saveResult.ok) {
      return handleResponse(res, saveResult)
    }
    const [savedPlan, eTag] = saveResult.value
    res.status(200).setHeader('ETag', eTag).json(savedPlan)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deletePlan = async (req: Request, res: Response) => {
  try {
    const { objectId } = req.params
    if (!objectId || objectId === '' || objectId === '{}') {
      res.status(400).json({ error: 'Missing objectId' })
      return
    }

    const keyExists = await redisService.doesKeyExist(objectId)
    if (!keyExists) {
      res.status(404).json({ error: `Object id doesn't exist` })
      return
    }

    const deleted = await redisService.delete(objectId)
    if (deleted === 0) throw new Error('Failed to delete object from Redis')
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const patchPlan = async (req: Request, res: Response) => {
  try {
    const plan = req.body as Plan
    if (!plan) {
      res.status(400).json({ error: 'Missing plan in body' })
      return
    }
    const result = await jsonParser.validate(plan, PlanModel)
    if (!result.ok) {
      return handleResponse(res, result)
    }

    const saveResult = await savePlanToRedis(plan, true)
    if (!saveResult.ok) {
      return handleResponse(res, saveResult)
    }
    const [savedPlan, eTag] = saveResult.value
    res.status(201).setHeader('ETag', eTag).json(savedPlan)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const planService = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  patchPlan,
  deletePlan
}

export default planService
