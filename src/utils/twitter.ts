import axios from 'axios'
import config from '../config'

export type TTwitterUser = {
  id: string
  name: string
  username: string
}

export type TTwitterParams = {
  max_results: number
  pagination_token?: string
}

const headers = {
  Authorization: `Bearer ${config.socials.twitter.bearerToken}`,
}

export const getTwitterFollowers = async (
  groupId: string,
  params: TTwitterParams,
) => axios.get(`https://api.twitter.com/2/users/${groupId}/followers`, { headers, params })

export const getTwitterLikes = async (
  postId: string,
  params: TTwitterParams,
) => axios.get(`https://api.twitter.com/2/tweets/${postId}/liking_users`, { headers, params })

export const getTwitterRetweets = async (
  postId: string,
  params: TTwitterParams,
) => axios.get(`https://api.twitter.com/2/tweets/${postId}/retweeted_by`, { headers, params })
