import { Application } from 'express'
import healthCheckController from '../controller/healthcheck.controller'
import nocache from 'nocache'
import { noCachePragma } from '../config/middleware'
import userController from '../controller/user.controller'
import { handleResponse } from '../utils/response'
import errors from '../utils/errors'

const routes = (app: Application) => {
  // Health Check route
  app.use('/healthz', nocache(), noCachePragma(), healthCheckController)

  // User routes
  app.use('/v1/user', userController)

  // Default fallback route
  app.route('*').all((_, res) => {
    handleResponse(res, errors.notFoundError('404 Not Found'))
  })
}

export default routes
