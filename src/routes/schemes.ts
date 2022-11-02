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

export const outputUser = (): Joi.Schema => outputSchema(Joi.object({
  id: Joi.string(),
  address: Joi.string(),
  name: Joi.string(),
  dateOfBirth: Joi.string(),
}))

export const userVariables = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  dateOfBirth: Joi.date().optional(),
})
