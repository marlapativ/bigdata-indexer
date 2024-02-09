import express, { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import planService from '../services/plan.service'

const planController: Router = express.Router()

planController
  .route('/:planId')
  .get(planService.getPlanById)
  .put(planService.updatePlan)
  .delete(planService.deletePlan)
  .all((_, res) => res.status(StatusCodes.METHOD_NOT_ALLOWED).send())

planController
  .get('/', planService.getPlans)
  .post('/', planService.createPlan)
  .all('/', (_, res) => res.status(StatusCodes.METHOD_NOT_ALLOWED).send())

export default planController
