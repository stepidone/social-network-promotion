import config from '../config'
import { server } from '../server/index'

type TSession = {
  address: string
  createdAt: Date
}

export class SessionClient {
  public static async get(messageHex: string): Promise<TSession> {
    return server.methods.redisGet(messageHex)
  }

  public static async set(messageHex: string, payload: TSession): Promise<boolean> {
    return server.methods.redisSet(messageHex, payload, { EX: config.auth.session.lifetime })
  }

  static async del(messageHex: string): Promise<boolean> {
    return server.methods.redisDel(messageHex)
  }
}