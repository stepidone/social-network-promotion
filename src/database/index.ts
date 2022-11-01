import { Plugin, Server } from '@hapi/hapi'
import { Sequelize, ModelCtor, Model } from 'sequelize-typescript'
import config from '../config'
import { UserModel } from './user'

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

    server.expose({
      /**
       * Get the underlying sequelize object
       * @returns sequelize object
       */
      sequelize: (): Sequelize => sequelize,
    })
  },
}