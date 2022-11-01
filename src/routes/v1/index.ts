import { ServerRoute } from '@hapi/hapi'
import user from './user'

const version = 'v1'
const routes: ServerRoute[] = [
  ...user,
]

routes.forEach((route) => route.path = `/${version}${route.path}`)

export default routes
