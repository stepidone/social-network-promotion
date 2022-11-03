import {
  AllowNull,
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
import { TaskModel } from './task'
import { UserModel } from './user'

enum ETaskStatisticType {
  not_completed = 'not_completed',
  processing = 'processing',
  completed = 'completed',
  rewarded = 'claimed',
}

type TTaskStatistic = {
  id: string
  userId: string
  taskId: number
  status: ETaskStatisticType
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

  @Default(ETaskStatisticType.not_completed)
  @AllowNull(false)
  @Column(DataType.STRING)
  status: ETaskStatisticType
  
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
