import { config } from 'dotenv'

config()

const isTest = process.env.NODE_ENV === 'test'

export default {
  isTest,
  server: {
    host: process.env.SERVER_HOST!,
    port: process.env.SERVER_PORT!,
  },
  database: {
    dialect: 'postgres',
    host: process.env.DATABASE_HOST!,
    database: process.env.DATABASE_DATABASE!,
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    port: Number(process.env.DATABASE_PORT)!,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },
  auth: {
    session: {
      lifetime: isTest ? 60 * 5 : 60 * 60 * 24, // One day seconds
    },
  },
}