import { getJobInstance } from './graphile'
import startListeners from './listener'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const init = async (): Promise<void> => {
  const job = getJobInstance()
  await job.start()

  await startListeners()
}
