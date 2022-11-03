import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import axios from 'axios'
import config from '../../config'
import { userGetById, UserModel } from '../../database/user'
import btoa from 'btoa'
import atob from 'atob'
import { boomConstructor, EError } from '../../utils/error'
import { output } from '../index'
import { ESocialPlatform, userSocialCreate, userSocialGetByExternalId, userSocialGetByUser } from '../../database/userSocial'

export const auth = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  if (await userSocialGetByUser(ESocialPlatform.twitter, user.id)) throw boomConstructor(EError.AlreadyExist)
  const url = 'https://twitter.com/i/oauth2/authorize?'
  const params = {
    client_id: config.socials.twitter.clientId,
    redirect_uri: `${config.server.url}/api/v1/twitter/verify`,
    response_type: 'code',
    scope: 'offline.access tweet.read users.read follows.read',
    state: btoa(
      JSON.stringify({
        userId: user.id,
      }),
    ),
    code_challenge: 'challenge',
    code_challenge_method: 'plain',
  }

  return reply.response(url + new URLSearchParams(params))
}

export const verify = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const { state, code } = request.query
  const { userId } = JSON.parse(atob(state))
  const user = await userGetById(userId)
  if (!user) throw boomConstructor(EError.UserNotFound)
  const tokenInfo = (await axios.post(
    'https://api.twitter.com/2/oauth2/token',
    new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: config.socials.twitter.clientId,
      redirect_uri: `${config.server.url}/api/v1/twitter/verify`,
      code_verifier: 'challenge',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  ).catch(() => ({ data: null }))).data
  const twitterInfo = (await axios.get(
    'https://api.twitter.com/2/users/me',
    {
      headers: {
        Authorization: `${tokenInfo.token_type} ${tokenInfo.access_token}`,
      },
    },
  ).catch(() => ({ data: null }))).data
  if (await userSocialGetByExternalId(ESocialPlatform.twitter, twitterInfo.data.id)) throw boomConstructor(EError.AlreadyExist)
  await userSocialCreate({
    platform: ESocialPlatform.twitter,
    userId: user.id,
    externalId: twitterInfo.data.id,
    name: twitterInfo.data.name,
  })
  return reply.response(output())
}