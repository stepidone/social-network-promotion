import { Plugin, Server } from '@hapi/hapi'
import { createClient } from 'redis'

export default <Plugin<string>> {
  name: 'redis',
  register: async (server: Server, url: string) => {
    const client = createClient({ url })
    client.on('error', (err: unknown) => console.error('Redis client stopped with error:', err))

    await client.connect()

    server.method('redisGet', async (key: string) => {
      const message = await client.get(key)
      return message ? JSON.parse(message) : null
    })
    server.method('redisSet', async (key: string, message: unknown, options = {}) => {
      const response = await client.set(
        key,
        typeof message === 'string' ? message : JSON.stringify(message),
        options,
      )
      return response === 'OK'
    })
    server.method('redisDel', async (key: string) => !!(await client.del(key)))
  },
}
