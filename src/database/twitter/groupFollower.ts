import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'
import { TwitterGroupModel } from './group'

type TTwitterFollower = {
  groupId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export type TCreateTwitterFollower = Pick<TTwitterFollower, 'groupId' | 'userId'>

@Table({
  tableName: 'TwitterFollowers',
  paranoid: true,
})
export class TwitterFollowerModel extends Model<TTwitterFollower, TCreateTwitterFollower> implements TTwitterFollower {
  @PrimaryKey
  @ForeignKey(() => TwitterGroupModel)
  @AllowNull(false)
  @Column(DataType.STRING)
  groupId: string

  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING)
  userId: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date
  
  @BelongsTo(() => TwitterGroupModel)
  group: TwitterGroupModel
}

export const getFollowerByGroupAndUser = async (
  groupId: string,
  userId: string,
): Promise<TwitterFollowerModel> => TwitterFollowerModel.findOne({
  where: {
    groupId,
    userId,
  },
})
