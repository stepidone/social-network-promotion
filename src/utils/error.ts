import { Boom } from '@hapi/boom'
import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'

export enum EError {
  InvalidPayload = 400000,
  Unauthorized = 401000,
  MissingFields = 401001,
  Forbidden = 403000,
  InvalidSignature = 403001,
  AlreadyExist = 403002,
  NotFound = 404000,
  SessionNotFound = 404001,
  UserNotFound = 404002,
  NotAcceptable = 406000,
  TooManyRequests = 429000,
  InternalServerError = 500000,
}

const errorMessage = {
  [EError.InvalidPayload]: 'Invalid payload',
  [EError.Unauthorized]: 'Unauthorized',
  [EError.MissingFields]: 'Missing fields',
  [EError.Forbidden]: 'Forbidden',
  [EError.AlreadyExist]: 'Already exist',
  [EError.InvalidSignature]: 'Invalid signature',
  [EError.NotFound]: 'NotFound',
  [EError.SessionNotFound]: 'Session not found',
  [EError.UserNotFound]: 'User not found',
  [EError.NotAcceptable]: 'Not acceptable',
  [EError.TooManyRequests]: 'Too many requests',
  [EError.InternalServerError]: 'Internal server error',
}

export const boomConstructor = (
  statusCode: EError,
  message?: string,
): Boom => new Boom(
  message || errorMessage[statusCode],
  { statusCode: Math.floor(statusCode / 1000) },
)

export const responseFilter = (
  request: Request,
  h: ResponseToolkit,
): ResponseObject | symbol => {   
  const { response } = request

  if ('isBoom' in response) {
    /**
     * Handle default hapi errors (like not found, etc.)
     */
    if (response.data === null) {
      request.response = h.response({
        ok: false,
        code: response.output.statusCode,
        data: {},
        msg: request.response.message,
      }).code(response.output.statusCode)

      return request.response
    }

    /**
     * Handle custom api error
     */
    if (!response.data.api) {
      request.response = h.response({
        ok: false,
        code: Math.floor(response.output.statusCode * 1000),
        data: {},
        msg: request.response.message,
      }).code(response.output.statusCode)

      return request.response
    }

    /**
     * Handle non api errors with data
     */
    request.response = h.response({
      ok: false,
      code: response.data.code,
      data: response.data.data,
      msg: response.output.payload.message,
    }).code(Math.floor(response.data.code / 1000))

    return request.response
  }

  return h.continue
}