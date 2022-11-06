import { Op } from 'sequelize'
import { sleep } from '../../utils'
import { EJobIdentifier, getJobInstance } from '../../utils/graphile'
import { getTwitterFollowers, TTwitterParams, TTwitterUser } from '../../utils/twitter'
import { ETaskStatus, ETaskType, TaskModel } from '../task'
import { ETwitterGroupStatus, TwitterGroupModel } from '../twitter/group'
import { TCreateTwitterFollower, TwitterFollowerModel } from '../twitter/groupFollower'

const recursiveFollowersUpdate = async (
  _groups: TwitterGroupModel[],
  _requestCount: number,
) => {
  const requestLimit = 15
  const requestTimeLimit = 1000 * 60 * 15
  const timestamp = new Date().getTime()
  const groups = [ ..._groups ]
  const group = groups[0]
  try {
    const params: TTwitterParams = { max_results: 1000 }
    if (group.paginationToken) params.pagination_token = group.paginationToken
    const response = (await getTwitterFollowers(group.id, params)).data
    if (response.data && response.data.length) {
      const followers: TCreateTwitterFollower[] = response.data.map((user: TTwitterUser) => ({
        groupId: group.id,
        userId: user.id,
      }))
      await TwitterFollowerModel.bulkCreate(followers, { ignoreDuplicates: true })
    }
    
    if (!response.meta.next_token) {
      await TwitterGroupModel.update({
        paginationToken: null,
        status: ETwitterGroupStatus.updated,
      }, {
        where: {
          id: group.id,
        },
      })
      groups.shift()
    } else {
      group.update({
        paginationToken: response.meta.next_token,
      })
    }

    if (groups.length) {
      let requestCount = Number(_requestCount)
      if (requestCount === requestLimit) {
        await sleep(requestTimeLimit)
        requestCount = 0
      }

      recursiveFollowersUpdate(groups, requestCount + 1)
    } else {
      throw undefined
    }
  } catch (err: any) {
    if (err) {
      console.error('twitter followers update error:', err.message)
      await TwitterGroupModel.update({
        status: ETwitterGroupStatus.pending,
      }, {
        where: {
          id: {
            [Op.in]: groups.map((group) => group.id),
          },
        },
      })
    }

    const job = getJobInstance()
    await job.addJob(
      EJobIdentifier.twitterFollow,
      {},
      {
        runAt: new Date(timestamp + requestTimeLimit),
      },
      true,
    )
  }
}

export default async (): Promise<void> => {
  const timestamp = new Date().getTime()
  try {
    const activeTasks = await TaskModel.findAll({
      where: {
        status: ETaskStatus.active,
        type: ETaskType.twitter_follow,
      },
    })
    if (!activeTasks.length) throw undefined
    let groups = await TwitterGroupModel.findAll({
      where: {
        id: {
          [Op.in]: activeTasks.map((task) => task.related.externalId),
        },
        status: ETwitterGroupStatus.pending,
      },
    })
    if (!groups.length) {
      groups = await TwitterGroupModel.findAll({
        where: {
          id: {
            [Op.in]: activeTasks.map((task) => task.related.externalId),
          },
        },
      })
  
      if (!groups.length) throw undefined
    }
    await TwitterGroupModel.update({
      status: ETwitterGroupStatus.processing,
    }, {
      where: {
        id: {
          [Op.in]: groups.map((group) => group.id),
        },
      },
    })
    recursiveFollowersUpdate(groups, 1)
  } catch (err) {
    if (err) console.error('twitter followers job error:')
    const delay = 1000 * 60 * 30
    const job = getJobInstance()
    await job.addJob(
      EJobIdentifier.twitterFollow,
      {},
      {
        runAt: new Date(timestamp + delay),
      },
      true,
    )
  }
}