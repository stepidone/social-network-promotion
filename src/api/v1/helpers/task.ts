import { RequestQuery } from '@hapi/hapi'
import axios from 'axios'
import { FindOptions, Op, Sequelize, WhereOptions } from 'sequelize'
import { output, TOutput } from '../../index'
import config from '../../../config'
import { ETaskType, TaskModel, TTask } from '../../../database/task'
import { TaskRewardModel, TTaskReward } from '../../../database/taskReward'
import { boomConstructor, EError } from '../../../utils/error'
import { ESocialPlatform, userSocialGetByUser } from '../../../database/userSocial'
import { UserModel } from '../../../database/user'
import { getFollowerByGroupAndUser } from '../../../database/twitter/groupFollower'
import { ETwitterPostInteractionType, getInteractionByGroupAndUser } from '../../../database/twitter/postInteraction'

export const formListOptions = (query: RequestQuery): FindOptions => {
  const options: FindOptions<TTask> = {}
  const where: WhereOptions<TTask> = {}
  const { name, offset, limit, status, type, order } = query

  if (limit) {
    options.limit = limit
  }

  if (offset !== undefined) {
    options.offset
  }

  if (name) {
    where.name = {
      [Op.iLike]: `%${name}%`,
    }
  }

  if (status) {
    where.status = {
      [Op.in]: status,
    }
  }

  if (type) {
    where.type = {
      [Op.in]: type,
    }
  }
  
  if (order) {
    options.order = []
    for (const [column, sort] of Object.entries(order)) {
      options.order.push(
        [Sequelize.col(column), sort as string],
      )
    }
  }

  options.where = where
  return options
}

export const validateTwitterUrl = (url: string): boolean => url.toLowerCase().startsWith('https://twitter.com/')

export const getTwitterIdByUsername = async (url: string): Promise<string> => {
  const username = url.split('?').shift().split('/').filter((i) => i).pop()
  const response = (await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: {
      Authorization: `Bearer ${config.socials.twitter.bearerToken}`,
    },
  }).catch(() => {
    throw boomConstructor(EError.Forbidden, 'Twitter services are currently unavailable')
  })).data

  if (!response.data) throw boomConstructor(EError.NotFound, 'Twitter user not found')

  return response.data.id
}

type standardizedTask = Omit<TTask, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  reward?: Omit<TTaskReward, 'taskId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
}

export const standardizeTask = (task: TaskModel, reward?: TaskRewardModel): TOutput<standardizedTask> => {
  const data: standardizedTask = {
    id: task.id,
    owner: task.owner,
    type: task.type,
    name: task.name,
    description: task.description,
    status: task.status,
    related: task.related,
  }

  if (reward || task.reward) {
    data.reward = {
      id: reward.id || task.reward.id,
      contractAddress: reward.contractAddress || task.reward.contractAddress,
      contractSymbol: reward.contractSymbol || task.reward.contractSymbol,
      contractDecimals: reward.contractDecimals || task.reward.contractDecimals,
      network: reward.network || task.reward.network,
      totalAmount: reward.totalAmount || task.reward.totalAmount,
      rewardAmount: reward.rewardAmount || task.reward.rewardAmount,
    }
  }

  return output(data)
}

type TAdditional = {
  externalId?: string
}

export const getAdditionalRelatedDataByType = async (
  type: ETaskType,
  related: {
    url?: string,
  },
): Promise<TAdditional> => {
  const additional: TAdditional = {}

  switch (type) {
    case ETaskType.twitter_follow: {
      if (!validateTwitterUrl(related.url)) throw boomConstructor(EError.InvalidPayload, 'Invalid URL')
      additional.externalId = await getTwitterIdByUsername(related.url)
      break
    }

    case ETaskType.twitter_like:
    case ETaskType.twitter_retweet: {
      if (!validateTwitterUrl(related.url)) throw boomConstructor(EError.InvalidPayload, 'Invalid URL')
      additional.externalId = related.url.split('?').shift().split('/').filter((i) => i).pop()
      break
    }
    
    default: {
      throw boomConstructor(EError.Forbidden, 'Unavailable type')
    }
  }

  return additional
}

export const checkTwitterFollow = async (
  user: UserModel,
  task: TaskModel,
): Promise<void> => {
  const userTwitter = await userSocialGetByUser(ESocialPlatform.twitter, user.id)
  if (!userTwitter) throw boomConstructor(EError.Forbidden, 'Connect twitter')
  const follower = await getFollowerByGroupAndUser(task.related.externalId, user.id)
  if (!follower) throw boomConstructor(EError.Forbidden, 'Task is not completed')
}

export const checkTwitterInteraction = (type: ETwitterPostInteractionType) => async (
  user: UserModel,
  task: TaskModel,
): Promise<void> => {
  const userTwitter = await userSocialGetByUser(ESocialPlatform.twitter, user.id)
  if (!userTwitter) throw boomConstructor(EError.Forbidden, 'Connect twitter')
  const record = await getInteractionByGroupAndUser(type, task.related.externalId, user.id)
  if (!record) throw boomConstructor(EError.Forbidden, 'Task is not completed')

}

export const checkHandlers = {
  [ETaskType.twitter_follow]: checkTwitterFollow,
  [ETaskType.twitter_like]: checkTwitterInteraction(ETwitterPostInteractionType.like),
  [ETaskType.twitter_retweet]: checkTwitterInteraction(ETwitterPostInteractionType.retweet),
}
