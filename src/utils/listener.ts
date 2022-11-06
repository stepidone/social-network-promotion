import Web3 from 'web3'
import * as uuid from 'uuid'
import config, { ENetwork } from '../config'
import { server } from '../server'
import { Contract, EventData } from 'web3-eth-contract'
import DispenserABI from '../contract/DispenserABI.json'
import { AbiItem } from 'web3-utils'
import { createEventLog } from '../database/eventLog'
import { sleep } from '.'
import { taskActivate } from '../database/task'
import { statRewarded } from '../database/TaskStatistic'

type TDispenserEvent = {
  user: string
  value: number
  nonce: string
  token: string
}

class DispenserListener {
  public network: ENetwork
  private web3: Web3
  private contract: Contract

  constructor (
    network: ENetwork,
  ) {
    this.network = network
    this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.chain.provider.wss[network]))
    this.contract = new this.web3.eth.Contract(DispenserABI as AbiItem[], config.chain.contract[network])
  }

  private async listen (fromBlock: number): Promise<void> {
    try {
      this.contract.events.allEvents({ fromBlock })
        .on('connected', () => console.info(`${this.network} listener started from ${fromBlock}`))      
        .on('changed', async (event: EventData) => {
          console.info(`${this.network} event ${event.event} removed`)
          await createEventLog({
            network: this.network,
            ...event,
            id: uuid.v4(),
          })
        })
        .on('data', async (event: EventData) => {
          try {
            const values = event.returnValues as TDispenserEvent
            switch (event.event) {
              case 'replenishedERC20': {
                await taskActivate(+values.nonce)
                break
              }
    
              case 'rewardedERC20': {
                await statRewarded(+values.nonce)
                break
              }
            }
            await createEventLog({
              network: this.network,
              ...event,
              id: uuid.v4(),
            })
            await server.methods.redisSet(`${this.network}_last_block`, event.blockNumber + 1)
          } catch (err) {
            console.error(`${this.network} listener event handler error:`, err)
          }
        })
        .on('error', (err: Error) => {
          console.error(err)
          throw new Error(err.message)
        })
    } catch (err) {
      console.error(`${this.network} listener error:`, err)
      await sleep(15000)
      console.info(`${this.network} listener restarting`)
      await this.listen(fromBlock)
    }
  }

  public async start (): Promise<void> {
    const fromBlock = await server.methods.redisGet(`${this.network}_last_block`) || config.chain.startBlock[this.network]
    console.info(`${this.network} listener starting`)
    await this.listen(fromBlock)
  }
}

export const listenerInstances: DispenserListener[] = []

export default async () => {
  for (const network of Object.values(ENetwork)) {
    const instance = new DispenserListener(network)
    await instance.start()
    listenerInstances.push(instance)
  }
}
