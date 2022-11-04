import { ServerRoute } from '@hapi/hapi'
import Joi from 'joi'
import * as handler from '../../api/v1/task'
import { ENetwork } from '../../config'
import { ETaskStatus, ETaskType } from '../../database/task'
import { addressValidation, outputSchema, outputTask, outputTaskList } from '../schemes'

export default <ServerRoute[]> [
  {
    method: 'GET',
    path: '/task/list',
    handler: handler.list,
    options: {
      tags: ['api', 'task', 'signature'],
      auth: {
        mode: 'optional',
        strategy: 'signature',
      },
      validate: {
        query: Joi.object({
          name: Joi.string().optional(),
          status: Joi.array().items(Joi.string().valid(...Object.values(ETaskStatus))).optional(),
          type: Joi.array().items(Joi.string().valid(...Object.values(ETaskType))).optional(),
          offset: Joi.number().integer().positive().optional(),
          limit: Joi.number().integer().positive().optional(),
          order: Joi.object().pattern(
            Joi.string().valid('id', 'name'),
            Joi.string().valid('ASC', 'DESC'),
          ).optional(),
        }),
      },
      response: {
        schema: outputTaskList,
      },
    },
  },
  {
    method: 'POST',
    path: '/task/create',
    handler: handler.create,
    options: {
      tags: ['api', 'task', 'signature'],
      auth: 'signature',
      validate: {
        payload: Joi.object({
          type: Joi.string().valid(...Object.values(ETaskType)).required(),
          name: Joi.string().min(5).max(255).regex(/^[a-zA-Z0-9-_.,!:; ]+$/).required(),
          description: Joi.string().min(5).max(511).regex(/^[a-zA-Z0-9-_.,!:; ]+$/).optional(),
          url: Joi.string().uri().required(),
          reward: Joi.object({
            contractAddress: Joi.string().custom(addressValidation).required(),
            network: Joi.string().valid(...Object.values(ENetwork)).required(),
            totalAmount: Joi.number().greater(0).multiple(Joi.ref('rewardAmount')).required(),
            rewardAmount: Joi.number().greater(0).required(),
          }).required(),
        }),
      },
      response: {
        schema: outputTask,
      },
    },
  },
  {
    method: 'PUT',
    path: '/task',
    handler: handler.update,
    options: {
      tags: ['api', 'task', 'signature'],
      auth: 'signature',
      validate: {
        payload: Joi.object({
          id: Joi.string().required(),
          name: Joi.string().min(5).max(255).regex(/^[a-zA-Z0-9-_.,!:; ]+$/).optional(),
          description: Joi.string().min(5).max(511).regex(/^[a-zA-Z0-9-_.,!:; ]+$/).optional(),
          url: Joi.string().uri().optional(),
          reward: Joi.object({
            contractAddress: Joi.string().custom(addressValidation).optional(),
            network: Joi.string().valid(...Object.values(ENetwork)).optional(),
            totalAmount: Joi.number().greater(0).optional(),
            rewardAmount: Joi.number().greater(0).optional(),
          }).optional(),
        }),
      },
      response: {
        schema: outputTask,
      },
    },
  },
  {
    method: 'DELETE',
    path: '/task',
    handler: handler.del,
    options: {
      tags: ['api', 'task', 'signature'],
      auth: 'signature',
      validate: {
        payload: Joi.object({
          id: Joi.string(),
        }),
      },
      response: {
        schema: outputSchema(),
      },
    },
  },
]