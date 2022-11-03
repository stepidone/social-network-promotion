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
import { TOptional } from './index'
import { UserModel } from './user'

export enum ESocialPlatform {
  twitter = 'twitter',
}

type TUserSocial = {
  id: string
  userId: string
  platform: ESocialPlatform
  externalId: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateUserSocial = TOptional<Pick<TUserSocial, 'platform' | 'externalId' | 'userId' | 'name'>, 'name'>

@Table({
  tableName: 'UserSocials',
  paranoid: true,
})
export class UserSocialModel extends Model<TUserSocial, TCreateUserSocial> implements TUserSocial {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.STRING)
  userId: string

  @AllowNull(false)
  @Column(DataType.STRING)
  platform: ESocialPlatform

  @AllowNull(false)
  @Column(DataType.STRING)
  externalId: string

  @AllowNull(true)
  @Column(DataType.STRING)
  name: string

  @AllowNull(true)
  @Column(DataType.DATE)
  dateOfBirth: Date
  
  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date

  @BelongsTo(() => UserModel)
  user: UserModel
}

export const userSocialCreate = async (
  data: TCreateUserSocial,
  options: CreateOptions<TUserSocial> = {},
): Promise<UserSocialModel> => UserSocialModel.create(data, options)

export const userSocialGetByExternalId = async (
  platform: ESocialPlatform,
  externalId: string,
): Promise<UserSocialModel> => UserSocialModel.findOne({
  where: {
    platform,
    externalId,
  },
})

export const userSocialGetByUser = async (
  platform: ESocialPlatform,
  userId: string,
): Promise<UserSocialModel> => UserSocialModel.findOne({
  where: {
    platform,
    userId,
  },
})
