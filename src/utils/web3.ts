import Web3 from 'web3'
import config, { ENetwork } from '../config'
import { boomConstructor, EError } from './error'
import ERC20ABI from '../contract/ERC20ABI.json'
import { AbiItem } from 'web3-utils'

const web3Empty = new Web3()

export const getMessageHex = (message: string): string => web3Empty.utils.utf8ToHex(message)

export const validateAddress = (address: string): boolean => web3Empty.utils.isAddress(address)

export const validateHex = (hex: string): boolean => web3Empty.utils.isHex(hex)

export const recoverAddress = (messageHex: string, signature: string) => web3Empty.eth.accounts.recover(messageHex, signature).toLowerCase()

type TERC20 = {
  decimals: number,
  symbol: string,
}

export const verifyERC20 = async (
  network: ENetwork,
  contractAddress: string,
): Promise<TERC20> => {
  const web3 = new Web3(config.provider[network])
  const code = await web3.eth.getCode(contractAddress)
  if (code === '0x') throw boomConstructor(EError.Forbidden, 'Invalid contract address')
  const functionSignature = web3.eth.abi.encodeFunctionSignature('decimals()')
  if (code.indexOf(functionSignature.slice(2, 10)) <= 0) throw boomConstructor(EError.Forbidden, 'Invalid contract')
  const contract = new web3.eth.Contract(ERC20ABI as AbiItem[], contractAddress)
  
  return {
    decimals: await contract.methods.decimals().call(),
    symbol: await contract.methods.symbol().call(),
  }
}
