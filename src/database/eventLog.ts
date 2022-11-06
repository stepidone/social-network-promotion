import { CreateOptions } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import * as uuid from 'uuid'
import { ENetwork } from '../config'

type TEventRaw = {
  data: string
  topics: string[]
}

type TEvent = {
  id: string
  network: ENetwork
  returnValues: unknown
  raw: TEventRaw
  event: string
  signature: string
  logIndex: number
  transactionIndex: number
  transactionHash: string
  blockHash: string
  blockNumber: number
  address: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateEventLog = Omit<TEvent, 'createdAt' | 'updatedAt' | 'deletedAt'>

@Table({
  tableName: 'EventLogs',
  paranoid: true,
})
export class EventLogModel extends Model<TEvent, TCreateEventLog> implements TEvent {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @AllowNull(false)
  @Column(DataType.STRING)
  network: ENetwork

  @AllowNull(true)
  @Column(DataType.JSONB)
  returnValues: unknown

  @AllowNull(false)
  @Column(DataType.JSONB)
  raw: TEventRaw

  @AllowNull(false)
  @Column(DataType.STRING)
  event: string

  @AllowNull(false)
  @Column(DataType.STRING)
  signature: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  logIndex: number

  @AllowNull(false)
  @Column(DataType.INTEGER)
  transactionIndex: number

  @AllowNull(false)
  @Column(DataType.STRING)
  transactionHash: string

  @AllowNull(false)
  @Column(DataType.STRING)
  blockHash: string

  @AllowNull(false)
  @Column(DataType.INTEGER)
  blockNumber: number

  @AllowNull(false)
  @Column(DataType.STRING)
  address: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date
}

export const createEventLog = async (
  data: TCreateEventLog,
  options: CreateOptions<TEvent> = {},
): Promise<EventLogModel> => EventLogModel.create(data, options)
