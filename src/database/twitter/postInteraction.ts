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
import { TwitterPostModel } from './post'

export enum ETwitterPostInteractionType {
  like = 'like',
  retweet = 'retweet',
}

type TTwitterPostInteraction = {
  type: ETwitterPostInteractionType
  postId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export type TCreateTwitterPostInteraction = Pick<TTwitterPostInteraction, 'type' | 'postId' | 'userId'>

@Table({
  tableName: 'TwitterPostInteractions',
  paranoid: true,
})
export class TwitterPostInteractionModel extends Model<TTwitterPostInteraction, TCreateTwitterPostInteraction> implements TTwitterPostInteraction {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING)
  type: ETwitterPostInteractionType

  @PrimaryKey
  @ForeignKey(() => TwitterPostModel)
  @AllowNull(false)
  @Column(DataType.STRING)
  postId: string

  @AllowNull(false)
  @Column(DataType.STRING)
  userId: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date
  
  @BelongsTo(() => TwitterPostModel)
  post: TwitterPostModel
}

export const getInteractionByGroupAndUser = async (
  type: ETwitterPostInteractionType,
  postId: string,
  userId: string,
): Promise<TwitterPostInteractionModel> => TwitterPostInteractionModel.findOne({
  where: {
    type,
    postId,
    userId,
  },
})
