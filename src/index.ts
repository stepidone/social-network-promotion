import serverCreate from './server/index'

(async (): Promise<void> => {
  try {
    const server = await serverCreate()
    await server.start()
    console.log(`[INFO] Server started at ${server.info.uri}`)
  } catch (err) {
    console.error('[ERROR] Failed to start server:', err)
  }
})()