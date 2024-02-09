import { Request, Response } from 'express'
import database from '../config/database'
const redisDatabase = database.getDatabaseConnection()

const fetchPlanById = async (planId: string) => {
  return await redisDatabase.get(planId)
}

const getPlans = async (req: Request, res: Response) => {}

const getPlanById = async (req, res) => {}

const createPlan = async (req, res) => {}

const updatePlan = async (req, res) => {}

const deletePlan = async (req, res) => {}

const planService = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
}

export default planService
