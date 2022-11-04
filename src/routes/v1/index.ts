import { ServerRoute } from '@hapi/hapi'
import task from './task'
import twitter from './twitter'
import user from './user'

const version = 'v1'
const routes: ServerRoute[] = [
  ...user,
  ...twitter,
  ...task,
]

routes.forEach((route) => route.path = `/${version}${route.path}`)

export default routes
