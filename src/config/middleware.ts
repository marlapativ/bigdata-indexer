import { Request, Response, NextFunction } from 'express'
import auth from 'basic-auth'
import logger from './logger'
import crypto from './crypto'
import errors from '../utils/errors'
import User from '../models/user.model'
import { setUserIdInContext } from './context'
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

export const authorized = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Checking if user is authorized')
    const result = auth(req)
    if (!result) {
      logger.info('User is not authorized')
      handleResponse(res, errors.unAuthorizedError())
      return
    }

    const username = result.name
    const user = await User.scope(['withPassword']).findOne({ where: { username } })
    if (!user) {
      logger.info(`Cannot find user. User: ${result!.name}`)
      handleResponse(res, errors.unAuthorizedError())
      return
    }

    const isPasswordMatch = await crypto.comparePassword(result!.pass, user!.password)
    if (!isPasswordMatch) {
      logger.info(`Password mismatch. User: ${result!.name}`)
      handleResponse(res, errors.unAuthorizedError())
      return
    }

    setUserIdInContext(user!.id)
    next()
  }
}
