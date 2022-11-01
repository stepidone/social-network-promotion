import {
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
import { CreateOptions } from 'sequelize'
import * as uuid from 'uuid'

type TUser = {
  id: string
  address: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateUser = Pick<TUser, 'address'>

@Table({
  tableName: 'Users',
})
export class UserModel extends Model<TUser, TCreateUser> implements TUser {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @Column(DataType.STRING)
  address: string
  
  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @DeletedAt
  deletedAt: Date
}

export const userCreate = async (
  data: TCreateUser,
  options: CreateOptions<TUser> = {},
): Promise<UserModel> => UserModel.create(data, options)

export const userGetByAddress = async (
  address: string,
): Promise<UserModel> => UserModel.findOne({ where: { address } })