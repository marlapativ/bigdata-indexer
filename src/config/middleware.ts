import { Request, Response, NextFunction } from 'express'
import logger from './logger'
import errors from '../utils/errors'
import { handleResponse } from '../utils/response'
import healthCheckService from '../services/healthcheck.service'

export const jsonErrorHandler = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: Error, req: Request, res: Response, _: NextFunction) => {
    logger.error(`Error: ${err.message} Request body: ${req.body}`)
    handleResponse(res, errors.validationError('Malformed JSON in request body', true))
  }
}

export const dbHealthCheck = () => {
  return async (_: Request, res: Response, next: NextFunction) => {
    const isHealthy = await healthCheckService.databaseHealthCheck()
    if (!isHealthy) {
      handleResponse(res, errors.serviceUnavailableError('Database is not healthy'))
      return
    }
    next()
  }
}

export const noCachePragma = () => {
  return (_: Request, res: Response, next: NextFunction) => {
    res.setHeader('Pragma', 'no-cache')
    next()
  }
}

export const noQueryParams = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const areQueryParamsPresent = req.query && Object.keys(req.query).length > 0
    if (areQueryParamsPresent) {
      handleResponse(res, errors.validationError('Query parameters are not allowed'))
      return
    }
    next()
  }
}
