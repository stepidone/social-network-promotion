import { Plugin, Server } from '@hapi/hapi'
import { Sequelize, ModelCtor, Model } from 'sequelize-typescript'
import config from '../config'
import { TaskRewardModel } from './taskReward'
import { TaskModel } from './task'
import { TaskStatisticModel } from './TaskStatistic'
import { UserModel } from './user'
import { UserSocialModel } from './userSocial'

export type TOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type TDatabaseOptions = Partial<{
  host: string
  port: number
  username: string
  password: string
  database: string
  dialect: 'postgres' | 'sqlite'
}>

export default <Plugin<TDatabaseOptions>> {
  name: 'database',
  register: async (server: Server, options: TDatabaseOptions) => {
    let sequelize: Sequelize
    const models: ModelCtor<Model<any, any>>[] = [
      UserModel,
      UserSocialModel,
      TaskModel,
      TaskRewardModel,
      TaskStatisticModel,
    ]

    if (config.isTest) {
      sequelize = new Sequelize(
        'sqlite::memory:',
        {
          models,
          logging: false,
          sync: {
            force: true,
            alter: true,
          },
        },
      )
      await sequelize.sync()
    } else {
      sequelize = new Sequelize({
        ...options,
        models,
        logging: false,
      })
    }

    server.method('transaction', async () => sequelize.transaction())
    server.expose({
      /**
       * Get the underlying sequelize object
       * @returns sequelize object
       */
      sequelize: (): Sequelize => sequelize,
    })
  },
}
