import type { Config } from '@jest/types'

process.env = {
  ...process.env,
  NODE_ENV: 'test',
  SERVER_HOST: 'localhost',
  SERVER_PORT: '3333',
}

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    'jest-extended',
  ],
  testEnvironment: 'node',
}

export default config