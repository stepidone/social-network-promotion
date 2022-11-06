import { config } from 'dotenv'

config()

const isTest = process.env.NODE_ENV === 'test'

export enum ENetwork {
  mumbai = 'mumbai',
}

export default {
  isTest,
  server: {
    host: process.env.SERVER_HOST!,
    port: process.env.SERVER_PORT!,
    url: process.env.SERVER_URL || `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
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
  socials: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      bearerToken: process.env.TWITTER_BEARER,
    },
  },
  chain: {
    contract: {
      [ENetwork.mumbai]: '0x50Bc12FAaBd9f3F7515d9a3538dE84d301B4842e',
    },
    provider: {
      wss: {
        [ENetwork.mumbai]: `wss://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      },
      http: {
        [ENetwork.mumbai]: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
    },
    validatorKey: {
      [ENetwork.mumbai]: process.env.MUMBAI_VALIDATOR_PRIVATE_KEY,
    },
    startBlock: {
      [ENetwork.mumbai]: 29012046,
    },
  },
}