import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import * as uuid from 'uuid'
import { ETaskStatus, taskGetById, TaskModel } from './task'
import { UserModel } from './user'

export enum ETaskStatisticStatus {
  notCompleted = 'not_completed',
  processing = 'processing',
  completed = 'completed',
  rewarded = 'claimed',
}

type TTaskStatistic = {
  id: string
  userId: string
  taskId: number
  status: ETaskStatisticStatus
  nonce: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateTaskStatistic = Pick<TTaskStatistic, 'userId' | 'taskId'>

@Table({
  tableName: 'TaskStatistics',
  paranoid: true,
})
export class TaskStatisticModel extends Model<TTaskStatistic, TCreateTaskStatistic> implements TTaskStatistic {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.STRING)
  userId: string

  @ForeignKey(() => TaskModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  taskId: number

  @Default(ETaskStatisticStatus.notCompleted)
  @AllowNull(false)
  @Column(DataType.STRING)
  status: ETaskStatisticStatus
  
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  nonce: number

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @BelongsTo(() => UserModel)
  user: UserModel

  @BelongsTo(() => TaskModel)
  task: TaskModel
}

export const statGetByTaskAndUser = async (
  taskId: number,
  userId: string,
): Promise<[TaskStatisticModel, boolean]> => TaskStatisticModel.findOrCreate({
  where: { taskId, userId },
  defaults: { taskId, userId },
})

export const statGetTaskRewardedCount = async (
  taskId: number,
): Promise<number> => TaskStatisticModel.count({
  where: {
    taskId,
  },
})

export const statRewarded = async (
  nonce: number,
): Promise<void> => {
  const [, [stat]] = await TaskStatisticModel.update({
    status: ETaskStatisticStatus.rewarded,
  }, {
    where: {
      nonce,
    },
    returning: true,
  })
  if (!stat) return
  const task = await taskGetById(stat.taskId)
  const count = await statGetTaskRewardedCount(task.id)
  if (task.reward.totalAmount >= task.reward.rewardAmount * count) await task.update({
    status: ETaskStatus.completed,
  })
}
