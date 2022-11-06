import { CreateOptions } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { TwitterFollowerModel } from './groupFollower'

export enum ETwitterGroupStatus {
  pending = 'pending',
  processing = 'processing',
  updated = 'updated'
}

type TTwitterGroup = {
  id: string
  status: ETwitterGroupStatus
  paginationToken: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateTwitterGroup = Pick<TTwitterGroup, 'id'>

@Table({
  tableName: 'TwitterGroups',
  paranoid: true,
})
export class TwitterGroupModel extends Model<TTwitterGroup, TCreateTwitterGroup> implements TTwitterGroup {
  @PrimaryKey
  @Column(DataType.STRING)
  id: string

  @Default(ETwitterGroupStatus.pending)
  @AllowNull(false)
  @Column(DataType.STRING)
  status: ETwitterGroupStatus
  
  @AllowNull(true)
  @Column(DataType.STRING)
  paginationToken: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @HasMany(() => TwitterFollowerModel)
  followers: TwitterFollowerModel[]
}

export const twitterGroupCreate = async (
  data: TCreateTwitterGroup,
  options: CreateOptions<TTwitterGroup> = {},
): Promise<[TwitterGroupModel, boolean]> => TwitterGroupModel.upsert(data, options)
