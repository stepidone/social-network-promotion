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

export const outputSchema = (result: Joi.Schema): Joi.Schema => Joi.object({
  status: Joi.boolean(),
  result,
})

export const outputUser = (): Joi.Schema => outputSchema(Joi.object({
  id: Joi.string(),
  address: Joi.string(),
}))
