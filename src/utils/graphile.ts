import { Pool, ClientConfig } from 'pg'
import { run, Runner, TaskSpec } from 'graphile-worker'
import updateTwitterFollowers from '../database/jobs/update-twitter-followers'
import config from '../config'
import updateTwitterLikes from '../database/jobs/update-twitter-likes'
import updateTwitterRetweet from '../database/jobs/update-twitter-retweet'

export enum EJobIdentifier {
  twitterFollow = 'update_twitter_followers',
  twitterLikes = 'update_twitter_likes',
  twitterRetweet = 'update_twitter_retweets',
}

export class JobModel {
  private pool: Pool
  private runner: Runner

  constructor(data: Required<Pick<ClientConfig, 'host' | 'port' | 'database' | 'user' | 'password'>>) {
    this.pool = new Pool(data)
  }

  public async start (): Promise<void> {
    this.runner = await run({
      pgPool: this.pool,
      taskList: {
        [EJobIdentifier.twitterFollow]: updateTwitterFollowers,
        [EJobIdentifier.twitterLikes]: updateTwitterLikes,
        [EJobIdentifier.twitterRetweet]: updateTwitterRetweet,
      },
    })

    /**
     * Starting twitter jobs
     */
    await this.addJob(EJobIdentifier.twitterFollow, {}, {}, true)
    await this.addJob(EJobIdentifier.twitterLikes, {}, {}, true)
    await this.addJob(EJobIdentifier.twitterRetweet, {}, {}, true)
  }

  public async deleteJob (
    identifier: EJobIdentifier,
  ): Promise<void> {
    await this.pool.query(
      'DELETE FROM graphile_worker.jobs WHERE task_identifier=$1::text',
      [identifier],
    )
  }

  public async addJob (
    identifier: EJobIdentifier,
    payload: unknown = {},
    spec: TaskSpec = {},
    unique = false,
  ): Promise<void> {
    if (unique) await this.deleteJob(identifier)
    await this.runner.addJob(identifier, payload, spec)
  }
}

let instance: JobModel

export const getJobInstance = (): JobModel => {
  if (!instance) instance = new JobModel({
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
  })
  
  return instance
}