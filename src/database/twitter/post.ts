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
import { TRequireAtLeastOne } from '..'
import { TwitterPostInteractionModel } from './postInteraction'

export enum ETwitterPostStatus {
  ignore = 'ignore',
  pending = 'pending',
  processing = 'processing',
  updated = 'updated'
}

type TTwitterPost = {
  id: string
  likeStatus: ETwitterPostStatus
  retweetStatus: ETwitterPostStatus
  likePaginationToken: string
  retweetPaginationToken: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateTwitterPost = TRequireAtLeastOne<Pick<TTwitterPost, 'id' | 'likeStatus' | 'retweetStatus'>, 'likeStatus' | 'retweetStatus'>

@Table({
  tableName: 'TwitterPosts',
  paranoid: true,
})
export class TwitterPostModel extends Model<TTwitterPost, TCreateTwitterPost> implements TTwitterPost {
  @PrimaryKey
  @Column(DataType.STRING)
  id: string

  @Default(ETwitterPostStatus.ignore)
  @AllowNull(false)
  @Column(DataType.STRING)
  likeStatus: ETwitterPostStatus

  @Default(ETwitterPostStatus.ignore)
  @AllowNull(false)
  @Column(DataType.STRING)
  retweetStatus: ETwitterPostStatus
  
  @AllowNull(true)
  @Column(DataType.STRING)
  likePaginationToken: string
  
  @AllowNull(true)
  @Column(DataType.STRING)
  retweetPaginationToken: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @HasMany(() => TwitterPostInteractionModel)
  interactions: TwitterPostInteractionModel[]
}

export const twitterPostCreate = async (
  data: TCreateTwitterPost,
  options: CreateOptions<TTwitterPost> = {},
): Promise<[TwitterPostModel, boolean]> => TwitterPostModel.upsert(data, options)
