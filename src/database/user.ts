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
import { CreateOptions, Optional } from 'sequelize'
import * as uuid from 'uuid'

export type TUser = {
  id: string
  address: string
  name: string
  dateOfBirth: Date
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

type TCreateUser = Optional<Pick<TUser, 'address' | 'name' | 'dateOfBirth'>, 'name' | 'dateOfBirth'>

@Table({
  tableName: 'Users',
  paranoid: true,
})
export class UserModel extends Model<TUser, TCreateUser> implements TUser {
  @PrimaryKey
  @Default(() => uuid.v4())
  @Column(DataType.STRING)
  id: string

  @AllowNull(false)
  @Column(DataType.STRING)
  address: string

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
}

export const userCreate = async (
  data: TCreateUser,
  options: CreateOptions<TUser> = {},
): Promise<UserModel> => UserModel.create(data, options)

export const userGetByAddress = async (
  address: string,
): Promise<UserModel> => UserModel.findOne({ where: { address } })