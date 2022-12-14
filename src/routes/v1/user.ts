import { ServerRoute } from '@hapi/hapi'
import Joi from 'joi'
import * as handler from '../../api/v1/user'
import { addressValidation, hexValidation, outputSchema, outputUserSchema, userVariablesSchema } from '../schemes'

export default <ServerRoute[]> [
  {
    method: 'GET',
    path: '/auth/message',
    handler: handler.getMessage,
    options: {
      tags: ['api', 'user', 'auth'],
      validate: {
        query: Joi.object({
          address: Joi.string().custom(addressValidation).required().description('EVM account address').example('0xd5e099c71b797516c10ed0f0d895f429c2781142'),
        }),
      },
      response: {
        schema: outputSchema(Joi.object({
          message: Joi.string().description('readable message').example('This request will...'),
          messageHex: Joi.string().description('converted message').example('0x12345...'),
        })),
      },
    },
  },
  {
    method: 'POST',
    path: '/user/signup',
    handler: handler.register,
    options: {
      tags: ['api', 'user'],
      validate: {
        payload: Joi.object({
          messageHex: Joi.string().custom(hexValidation).required().description('Converted message').example('0x12345'),
          signature: Joi.string().custom(hexValidation).required().description('Signature of converted message').example('0x12345'),
          info: userVariablesSchema.optional().default({}),
        }),
      },
      response: {
        schema: outputUserSchema,
      },
    },
  },
  {
    method: 'GET',
    path: '/user/signin',
    handler: handler.login,
    options: {
      tags: ['api', 'user', 'signature'],
      auth: 'signature',
      response: {
        schema: outputUserSchema,
      },
    },
  },
  {
    method: 'PUT',
    path:  '/user',
    handler: handler.upd,
    options: {
      tags: ['api', 'user', 'signature'],
      auth: 'signature',
      validate: {
        payload: userVariablesSchema.required(),
      },
      response: {
        schema: outputUserSchema,
      },
    },
  },
  {
    method: 'DELETE',
    path:  '/user',
    handler: handler.del,
    options: {
      tags: ['api', 'user', 'signature'],
      auth: 'signature',
      response: {
        schema: outputSchema(),
      },
    },
  },
]
