import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { Transaction } from 'sequelize'
import { output } from '../index'
import { ENetwork } from '../../config'
import { ETaskStatus, ETaskType, taskCreate, taskGetById, taskGetPublicList, TCreateTask } from '../../database/task'
import { taskRewardCreate, TCreateTaskReward } from '../../database/taskReward'
import { UserModel } from '../../database/user'
import { server } from '../../server'
import { boomConstructor, EError } from '../../utils/error'
import { verifyERC20 } from '../../utils/web3'
import { formListOptions, getAdditionalRelatedDataByType, standardizeTask } from './helpers/task'

export const list = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  const options = formListOptions(request.query)
  const list = await taskGetPublicList(options, user?.id)
  return reply.response(output(list))
}

type TTaskRewardCreate = {
  contractAddress: string
  network: ENetwork
  totalAmount: number
  rewardAmount: number
}

type TTaskCreatePayload = {
  type: ETaskType
  name: ENetwork
  description: string
  url: string
  reward: TTaskRewardCreate
}

export const create = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  const payload = request.payload as TTaskCreatePayload
  const transaction = await server.methods.transaction() as Transaction

  try {
    const { decimals, symbol } = await verifyERC20(payload.reward.network, payload.reward.contractAddress)
    const taskData: TCreateTask = {
      owner: user.address,
      name: payload.name,
      description: payload.description,
      type: payload.type,
      related: {
        url: payload.url,
        ...await getAdditionalRelatedDataByType(payload.type, { url: payload.url }),
      },
    }
    const task = await taskCreate(taskData, { transaction })

    const rewardData: TCreateTaskReward = {
      taskId: task.id,
      contractAddress: payload.reward.contractAddress,
      contractSymbol: symbol,
      contractDecimals: decimals,
      network: payload.reward.network,
      totalAmount: payload.reward.totalAmount,
      rewardAmount: payload.reward.rewardAmount,
    }
    const reward = await taskRewardCreate(rewardData, { transaction })

    await transaction.commit()
    return reply.response(standardizeTask(task, reward))
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

type TTaskUpdatePayload = Partial<Omit<TTaskCreatePayload, 'type' | 'reward'>> & {
  id: string
  reward?: Partial<TTaskRewardCreate>
}

export const update = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  const payload = request.payload as TTaskUpdatePayload
  const transaction = await server.methods.transaction() as Transaction
  try {
    const taskData: {
      [key: string]: unknown
    } = {}
    const rewardData: {
      [key: string]: unknown
    } = {}
    const task = await taskGetById(payload.id)
    if (!task) throw boomConstructor(EError.NotFound, 'Task not found')
    if (task.owner !== user.address) throw boomConstructor(EError.Forbidden, 'No permission')
    if (task.status !== ETaskStatus.created) throw boomConstructor(EError.Forbidden, 'No longer available')
    for (const [column, _value] of Object.entries(payload)) {
      switch (column) {
        case 'name':
        case 'description': {
          taskData[column] = _value
          break
        }

        case 'url': {
          taskData.related = {
            externalId: await getAdditionalRelatedDataByType(task.type, { url: _value as string }),
            url: _value,
          }
        }

        case 'reward': {
          const value = _value as Partial<TTaskRewardCreate>
          if (value.contractAddress) {
            const { decimals, symbol } = await verifyERC20(value.network || task.reward.network, value.contractAddress)
            rewardData.network = value.network || task.reward.network
            rewardData.contractSymbol = value.contractAddress
            rewardData.contractDecimals = decimals
            rewardData.contractAddress = symbol
          }

          if (value.rewardAmount || value.totalAmount) {
            const remainder = value.totalAmount || task.reward.totalAmount % value.rewardAmount || task.reward.rewardAmount
            if (remainder) throw boomConstructor(EError.Forbidden, 'The award must end without a trace')
            rewardData.totalAmount = value.totalAmount || task.reward.totalAmount
            rewardData.rewardAmount = value.rewardAmount || task.reward.rewardAmount
          }
        }
      }
    }
    await task.update(taskData, { transaction })
    await task.reward.update(rewardData, { transaction })
    await transaction.commit()
    return reply.response(output(standardizeTask(task)))
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export const del = async (
  request: Request,
  reply: ResponseToolkit,
): Promise<ResponseObject> => {
  const user = request.auth.credentials.user as UserModel
  const { id } = request.payload as { id: string }
  const task = await taskGetById(id)
  if (!task) throw boomConstructor(EError.NotFound, 'Task not found')
  if (task.owner !== user.address) throw boomConstructor(EError.Forbidden, 'No permission')
  if (task.status !== ETaskStatus.created) throw boomConstructor(EError.Forbidden, 'No longer available')
  await task.destroy()
  return reply.response(output())
}
