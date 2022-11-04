import Joi from 'joi'
import { validateAddress, validateHex } from '../utils/web3'

export const addressValidation = (value: string) => {
  if (!validateAddress(value)) throw new Error('Address is not valid')
  return value.toLowerCase()
}

export const hexValidation = (value: string) => {
  if (!validateHex(value)) throw new Error('Hex is not valid')
  return value
}

export const outputSchema = (result?: Joi.Schema): Joi.Schema => result
  ? Joi.object({
    status: Joi.boolean(),
    result,
  })
  : Joi.object({
    status: Joi.boolean(),
  })

export const outputUser = outputSchema(Joi.object({
  id: Joi.string(),
  address: Joi.string(),
  name: Joi.string(),
  dateOfBirth: Joi.string(),
}))

const taskSchema = Joi.object({
  id: Joi.number(),
  owner: Joi.string(),
  type: Joi.string(),
  name: Joi.string(),
  description: Joi.string().allow(null),
  status: Joi.string(),
  related: Joi.object({
    url: Joi.string(),
    externalId: Joi.string(),
  }).allow(null),
  reward: Joi.object({
    id: Joi.string(),
    contractAddress: Joi.string(),
    contractSymbol: Joi.string(),
    contractDecimals: Joi.number(),
    network: Joi.string(),
    totalAmount: Joi.string(),
    rewardAmount: Joi.string(),
  }),
})

export const outputTask = outputSchema(taskSchema)

export const outputTaskList = outputSchema(Joi.object({
  count: Joi.number(),
  rows: Joi.array().items(
    taskSchema.concat(Joi.object({
      passingStatus: Joi.string().allow(null),
    })),
  ),
}))

export const userVariables = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  dateOfBirth: Joi.date().optional(),
})
