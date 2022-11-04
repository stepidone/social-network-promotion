import { Request, ResponseToolkit } from '@hapi/hapi'
import { userGetByAddress } from '../database/user'
import { SessionClient } from '../redis/session'
import { boomConstructor, EError } from './error'
import { recoverAddress } from './web3'

export const signatureAuth = () => ({
  authenticate: async (request: Request, response: ResponseToolkit) => {
    const isOptionalAuth = request.auth.mode === 'optional'
    const { 'signature': signature, 'message-hex': messageHex } = request.headers
    if (!messageHex || !signature) {
      if (isOptionalAuth) {
        return response.unauthenticated(null, { credentials: { user: null } })
      }

      throw boomConstructor(EError.MissingFields)
    }

    const address = recoverAddress(messageHex, signature)
    const session = await SessionClient.get(messageHex)
    if (!session) throw boomConstructor(EError.SessionNotFound)
    if (session.address !== address) throw boomConstructor(EError.InvalidSignature)
    const user = await userGetByAddress(address)
    if (!user) throw boomConstructor(EError.UserNotFound)

    return response.authenticated({ credentials: { user } })
  },
})
