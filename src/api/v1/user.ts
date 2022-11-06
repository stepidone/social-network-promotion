import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import * as uuid from 'uuid'
import { output } from '..'
import config from '../../config'
import { userCreate, userGetByAddress, UserModel } from '../../database/user'
import { SessionClient } from '../../redis/session'
import { boomConstructor, EError } from '../../utils/error'
import { getMessageHex, recoverAddress } from '../../utils/web3'

const standardizeUser = (user: UserModel) => output({
  id: user.id,
  address: user.address,
  name: user.name,
})

export const getMessage = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const { address } = request.query
  const createdAt = new Date(request.info.received)
  const expireDate = new Date(request.info.received + config.auth.session.lifetime * 1000)
  const message = `This request will not trigger a blockchain transaction or cost any gas fees.\nAuthentication session will be active until ${expireDate.toUTCString()}\nWallet address: ${address}\nNonce: ${uuid.v4()}`
  const messageHex = getMessageHex(message)
  const isCreated = await SessionClient.set(messageHex, {
    address,
    createdAt,
  })
  if (!isCreated) throw boomConstructor(EError.InternalServerError, 'Redis error')

  return reply.response(output({
    message,
    messageHex,
  }))
}

type TUserVariables = {
  name: string
}

type TRegister = {
  signature: string
  messageHex: string
  info?: TUserVariables
}

export const register = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const { signature, messageHex, info } = request.payload as TRegister
  const address = recoverAddress(messageHex, signature)
  const session = await SessionClient.get(messageHex)
  if (!session) throw boomConstructor(EError.SessionNotFound)
  if (session.address !== address) throw boomConstructor(EError.InvalidSignature)
  if (await userGetByAddress(address)) throw boomConstructor(EError.AlreadyExist)
  const user = await userCreate({ address, ...info })
  return reply.response(standardizeUser(user))
}

export const login = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  return reply.response(standardizeUser(user))
}

export const upd = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const payload = request.payload as TUserVariables
  const user = request.auth.credentials.user as UserModel
  await user.update(payload)
  return reply.response(standardizeUser(user))
}

export const del = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  await user.destroy()
  return reply.response(output())
}
