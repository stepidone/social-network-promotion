import Qs from 'qs'
import { Server, ServerRegisterPluginObject } from '@hapi/hapi'
import Basic from '@hapi/basic'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiSwagger from 'hapi-swagger'
import SwaggerOptions from '../config/swagger'
import config from '../config/index'
import Database from '../database'
import Redis from '../redis'
import routes from '../routes'
import { signatureAuth } from '../utils/auth'
import { responseFilter } from '../utils/error'

export const server = new Server({
  host: config.server.host,
  port: config.server.port,
  routes: {
    validate: {
      failAction: (request, h ,err) => {
        throw err
      },
    },
    cors: {
      origin: ['*'],
      headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Message-Hex', 'Signature'],
    },
  },
  query: {
    parser: (query) => Qs.parse(query),
  },
})

const plugins: ServerRegisterPluginObject<any>[] = [
  {
    plugin: Basic,
  },
  {
    plugin: Inert,
  },
  {
    plugin: Vision,
  },
  {
    plugin: HapiSwagger,
    options: SwaggerOptions,
  },
  {
    plugin: Database,
    options: config.database,
  },
  {
    plugin: Redis,
    options: config.redis.url,
  },
]

export default async (): Promise<Server> => {
  server.realm.modifiers.route.prefix = '/api'
  server.ext('onPreResponse', responseFilter)
  await server.register(plugins)
  server.auth.scheme('custom', signatureAuth)
  server.auth.strategy('signature', 'custom')
  server.route(routes)
  return server
}