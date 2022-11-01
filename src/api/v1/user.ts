import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import * as uuid from 'uuid'
import { output } from '..'
import config from '../../config'
import { userCreate, userGetByAddress, UserModel } from '../../database/user'
import { SessionClient } from '../../redis/session'
import { boomConstructor, EError } from '../../utils/error'
import { getMessageHex, recoverAddress } from '../../utils/web3'

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
  if (!isCreated) throw boomConstructor(EError.InternalServerError)

  return reply.response(output({
    message,
    messageHex,
  }))
}

export const register = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const { signature, messageHex } = request.payload as { signature: string, messageHex: string }
  const address = recoverAddress(messageHex, signature)
  const session = await SessionClient.get(messageHex)
  if (!session) throw boomConstructor(EError.SessionNotFound)
  if (session.address !== address) throw boomConstructor(EError.InvalidSignature)
  if (await userGetByAddress(address)) throw boomConstructor(EError.AlreadyExist)
  const user = await userCreate({ address })
  return reply.response(output({ id: user.id, address: user.address }))
}

export const login = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  return reply.response(output({ id: user.id, address: user.address }))
}
