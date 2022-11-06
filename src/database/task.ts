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
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { CreateOptions, FindAttributeOptions, FindOptions, Includeable, Sequelize } from 'sequelize'
import { TOptional } from './index'
import { TaskRewardModel } from './taskReward'
import { TaskStatisticModel } from './TaskStatistic'
import { UserModel } from './user'
import { twitterGroupCreate } from './twitter/group'
import { ETwitterPostStatus, twitterPostCreate } from './twitter/post'

export enum ETaskType {
  twitter_follow = 'twitter_follow',
  twitter_like = 'twitter_like',
  twitter_retweet = 'twitter_retweet',
}

export enum ETaskStatus {
  created = 'created',
  active = 'active',
  completed = 'completed',
}

type ETwitterRelated = {
  url: string
  externalId?: string
}

export type TTask = {
  id: number
  owner: string
  type: ETaskType
  name: string
  description: string
  status: ETaskStatus
  related: ETwitterRelated
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export type TCreateTask = TOptional<Pick<TTask, 'type' | 'name' | 'description' | 'related' | 'owner'>, 'description' | 'related'>

@Scopes(() => ({
  public(userId: string) {
    const include: Includeable[] = [
      {
        model: TaskRewardModel,
        attributes: {
          exclude: ['taskId', 'createdAt', 'updatedAt', 'deletedAt'],
        },
      },
    ]

    const attributes: FindAttributeOptions = {
      include: [],
      exclude: ['createdAt', 'updatedAt', 'deletedAt'],
    }

    if (userId) {
      include.push({
        model: TaskStatisticModel,
        where: {
          userId,
        },
        required: false,
        attributes: [],
      })
      attributes.include.push(
        [Sequelize.col('userStats.status'), 'passingStatus'],
      )
    }

    const options: FindOptions<TTask> = {
      where: {
        status: ETaskStatus.active,
      },
      include,
      attributes,
      raw: true,
      nest: true,
    }

    return options
  },
}))
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
  owner: string

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

export const taskGetPublicList = async (
  options: FindOptions<TTask>,
  userId: string = null,
): Promise<{ count: number, rows: TaskModel[] }> => TaskModel.scope({ method: ['public', userId] }).findAndCountAll(options)

export const taskGetById = async (
  id: number,
): Promise<TaskModel> => TaskModel.findByPk(id, {
  include: [
    {
      model: TaskRewardModel,
    },
  ],
})

export const taskActivate = async (
  id: number,
): Promise<void> => {
  const [, [task]] = await TaskModel.update({
    status: ETaskStatus.active,
  }, {
    where: {
      id,
    },
    returning: true,
  })
  if (!task) return
  switch (task.type) {
    case ETaskType.twitter_follow: {
      await twitterGroupCreate({
        id: task.related.externalId,
      })

      break
    }

    case ETaskType.twitter_like: {
      await twitterPostCreate({
        id: task.related.externalId,
        likeStatus: ETwitterPostStatus.pending,
      })

      break
    }

    case ETaskType.twitter_retweet: {
      await twitterPostCreate({
        id: task.related.externalId,
        retweetStatus: ETwitterPostStatus.pending,
      })

      break
    }
  }
}
