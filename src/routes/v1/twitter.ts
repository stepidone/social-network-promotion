import { ServerRoute } from '@hapi/hapi'
import * as handler from '../../api/v1/twitter'

export default <ServerRoute[]> [
  {
    method: 'GET',
    path: '/twitter/auth',
    handler: handler.auth,
    options: {
      tags: ['api', 'user', 'twitter', 'signature'],
      auth: 'signature',
    },
  },
  {
    method: 'GET',
    path: '/twitter/verify',
    handler: handler.verify,
  },
]
