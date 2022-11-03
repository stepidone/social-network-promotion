import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { CreateOptions } from 'sequelize'
import { TOptional } from './index'
import { TaskRewardModel } from './taskReward'
import { TaskStatisticModel } from './TaskStatistic'
import { UserModel } from './user'

enum ETaskType {
  twitter_follow = 'twitter_follow',
  twitter_like = 'twitter_like',
  twitter_retweet = 'twitter_retweet',
}

enum ETaskStatus {
  created = 'created',
  active = 'active',
  completed = 'completed',
}

type ETwitterRelated = {
  url: string
  externalId: string
}

type TTask = {
  id: number
  type: ETaskType
  name: string
  description: string
  status: ETaskStatus
  related: ETwitterRelated
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateTask = TOptional<Pick<TTask, 'type' | 'name' | 'description' | 'related'>, 'description' | 'related'>

@Table({
  tableName: 'Tasks',
  paranoid: true,
})
export class TaskModel extends Model<TTask, TCreateTask> implements TTask {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number

  @AllowNull(false)
  @Column(DataType.STRING)
  type: ETaskType

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string

  @AllowNull(true)
  @Column(DataType.STRING(511))
  description: string

  @Default(ETaskStatus.created)
  @AllowNull(false)
  @Column(DataType.STRING)
  status: ETaskStatus

  @AllowNull(true)
  @Column(DataType.JSONB)
  related: ETwitterRelated

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @HasOne(() => TaskRewardModel)
  reward: TaskRewardModel

  @HasMany(() => TaskStatisticModel)
  userStats: TaskStatisticModel[]

  @BelongsToMany(() => UserModel, () => TaskStatisticModel)
  users: UserModel[]
}

export const taskCreate = async (
  data: TCreateTask,
  options: CreateOptions<TTask> = {},
): Promise<TaskModel> => TaskModel.create(data, options)
