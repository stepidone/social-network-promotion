import { Op } from 'sequelize'
import { sleep } from '../../utils'
import { EJobIdentifier, getJobInstance } from '../../utils/graphile'
import { getTwitterLikes, TTwitterParams, TTwitterUser } from '../../utils/twitter'
import { ETaskStatus, ETaskType, TaskModel } from '../task'
import { ETwitterPostStatus, TwitterPostModel } from '../twitter/post'
import { ETwitterPostInteractionType, TCreateTwitterPostInteraction, TwitterPostInteractionModel } from '../twitter/postInteraction'

const recursiveLikesUpdate = async (
  _posts: TwitterPostModel[],
  _requestCount: number,
) => {
  const requestLimit = 75
  const requestTimeLimit = 1000 * 60 * 15
  const timestamp = new Date().getTime()
  const posts = [ ..._posts ]
  const post = posts[0]
  try {
    const params: TTwitterParams = { max_results: 100 }
    if (post.likePaginationToken) params.pagination_token = post.likePaginationToken
    const response = (await getTwitterLikes(post.id, params)).data
    if (response.data && response.data.length) {
      const likedUsers: TCreateTwitterPostInteraction[] = response.data.map((user: TTwitterUser) => ({
        type: ETwitterPostInteractionType.like,
        postId: post.id,
        userId: user.id,
      }))
      await TwitterPostInteractionModel.bulkCreate(likedUsers, { ignoreDuplicates: true })
    }

    if (!response.meta.next_token) {
      await TwitterPostModel.update({
        likePaginationToken: null,
        likeStatus: ETwitterPostStatus.updated,
      }, {
        where: {
          id: post.id,
        },
      })
      posts.shift()
    } else {
      await post.update({
        likePaginationToken: response.meta.next_token,
      })
    }

    if (posts.length) {
      let requestCount = Number(_requestCount)
      if (requestCount === requestLimit) {
        await sleep(requestTimeLimit)
        requestCount = 0
      }

      recursiveLikesUpdate(posts, requestCount + 1)
    } else {
      throw undefined
    }
  } catch (err: any) {
    if (err) {
      console.error('twitter followers update error:', err.message)
      await TwitterPostModel.update({
        likeStatus: ETwitterPostStatus.pending,
      }, {
        where: {
          id: {
            [Op.in]: posts.map((post) => post.id),
          },
        },
      })
    }

    const job = getJobInstance()
    await job.addJob(
      EJobIdentifier.twitterLikes,
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
        type: ETaskType.twitter_like,
      },
    })
    if (!activeTasks.length) throw undefined
    let posts = await TwitterPostModel.findAll({
      where: {
        id: {
          [Op.in]: activeTasks.map((task) => task.related.externalId),
        },
        likeStatus: ETwitterPostStatus.pending,
      },
    })
    if (!posts.length) {
      posts = await TwitterPostModel.findAll({
        where: {
          id: {
            [Op.in]: activeTasks.map((task) => task.related.externalId),
          },
          likeStatus: {
            [Op.not]: [ETwitterPostStatus.ignore],
          },
        },
      })
  
      if (!posts.length) throw undefined
    }
    await TwitterPostModel.update({
      likeStatus: ETwitterPostStatus.processing,
    }, {
      where: {
        id: {
          [Op.in]: posts.map((post) => post.id),
        },
      },
    })
    recursiveLikesUpdate(posts, 1)
  } catch (err) {
    if (err) console.error('twitter followers job error:')
    const delay = 1000 * 60 * 30
    const job = getJobInstance()
    await job.addJob(
      EJobIdentifier.twitterLikes,
      {},
      {
        runAt: new Date(timestamp + delay),
      },
      true,
    )
  }
}