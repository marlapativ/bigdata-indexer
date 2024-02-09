import { StatusCodes } from 'http-status-codes'
import { ResultError } from './result'

export class HttpStatusError extends Error implements ResultError<HttpStatusError> {
  statusCode: number
  ok: false
  error: this
  ignoreMessage: boolean

  constructor(message: string, statusCode: number, ignoreMessage: boolean = false) {
    super(message)
    this.statusCode = statusCode
    this.name = 'HttpStatusError'
    this.ok = false
    this.error = this
    this.ignoreMessage = ignoreMessage
  }
}

const errors = {
  unAuthorizedError: () => new HttpStatusError('Unauthorized', StatusCodes.UNAUTHORIZED),
  serviceUnavailableError: (message: string) => new HttpStatusError(message, StatusCodes.SERVICE_UNAVAILABLE),
  notFoundError: (message: string) => new HttpStatusError(message, StatusCodes.NOT_FOUND),
  internalServerError: (message: string) => new HttpStatusError(message, StatusCodes.INTERNAL_SERVER_ERROR),
  methodNotAllowedError: (message?: string) => new HttpStatusError(message ?? '', StatusCodes.METHOD_NOT_ALLOWED),
  validationError: (message: string, ignoreMessage: boolean = false) =>
    new HttpStatusError(message, StatusCodes.BAD_REQUEST, ignoreMessage)
}

export default errors
