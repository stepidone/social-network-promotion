import serverCreate from './server/index'
import { init } from './utils'

(async (): Promise<void> => {
  try {
    const server = await serverCreate()
    await init()
    await server.start()
    console.log(`[INFO] Server started at ${server.info.uri}`)
  } catch (err) {
    console.error('[ERROR] Failed to start server:', err)
  }
})()