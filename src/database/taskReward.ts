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
import { CreateOptions } from 'sequelize'
import * as uuid from 'uuid'
import { TaskModel } from './task'
import { ENetwork } from '../config'

export type TTaskReward = {
  id: string
  taskId: number
  contractAddress: string
  contractSymbol: string
  contractDecimals: number
  network: ENetwork
  totalAmount: number
  rewardAmount: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export type TCreateTaskReward = Omit<TTaskReward, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

@Table({
  tableName: 'TaskRewards',
  paranoid: true,
})
export class TaskRewardModel extends Model<TTaskReward, TCreateTaskReward> implements TTaskReward {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @ForeignKey(() => TaskModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  taskId: number

  @AllowNull(false)
  @Column(DataType.STRING)
  contractAddress: string

  @AllowNull(false)
  @Column(DataType.STRING)
  contractSymbol: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  contractDecimals: number

  @AllowNull(false)
  @Column(DataType.STRING)
  network: ENetwork

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  rewardAmount: number

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  totalAmount: number
  
  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @BelongsTo(() => TaskModel)
  task: TaskModel
}

export const taskRewardCreate = async (
  data: TCreateTaskReward,
  options: CreateOptions<TTaskReward> = {},
): Promise<TaskRewardModel> => TaskRewardModel.create(data, options)
