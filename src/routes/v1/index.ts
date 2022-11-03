import { ServerRoute } from '@hapi/hapi'
import twitter from './twitter'
import user from './user'

const version = 'v1'
const routes: ServerRoute[] = [
  ...user,
  ...twitter,
]

routes.forEach((route) => route.path = `/${version}${route.path}`)

export default routes
