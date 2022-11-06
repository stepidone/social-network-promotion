import Web3 from 'web3'
import config, { ENetwork } from '../config'
import { boomConstructor, EError } from './error'
import ERC20ABI from '../contract/ERC20ABI.json'
import { AbiItem, Unit } from 'web3-utils'
import BN from 'bn.js'

const web3Empty = new Web3()

export const getMessageHex = (message: string): string => web3Empty.utils.utf8ToHex(message)

export const validateAddress = (address: string): boolean => web3Empty.utils.isAddress(address)

export const validateHex = (hex: string): boolean => web3Empty.utils.isHex(hex)

export const recoverAddress = (messageHex: string, signature: string) => web3Empty.eth.accounts.recover(messageHex, signature).toLowerCase()

export const numberToUnit = {
  0: 'wei',
  3: 'kwei',
  6: 'mwei',
  9: 'gwei',
  12: 'szabo',
  15: 'finney',
  18: 'ether',
  21: 'kether',
  24: 'mether',
  27: 'gether',
  30: 'tether',
}

export const numberShiftRight = (
  amount: number,
  decimals: keyof typeof numberToUnit,
): BN => web3Empty.utils.toBN(web3Empty.utils.toWei(String(amount), numberToUnit[decimals] as Unit))

type TMessageToSign = {
  [key: string]: {
    t: string
    v: number | string | BN
  }
}

type TSignedMessage = {
  v: string
  r: string
  s: string
}

export const signByValidator = (
  _message: TMessageToSign,
  network: ENetwork,
): TSignedMessage => {
  const keys = Object.keys(_message)
  const values = Object.values(_message)
  const sha3 = web3Empty.utils.soliditySha3(...values)
  const signature = web3Empty.eth.accounts.sign(sha3, config.chain.validatorKey[network])

  const message: { [key: string]: string | number | BN } = {}
  for (let i = 0; i < keys.length; i++) {
    message[keys[i]] = String(values[i].v)
  }

  return {
    ...message,
    v: signature.v,
    r: signature.r,
    s: signature.s,
  }
}

type TERC20 = {
  decimals: number,
  symbol: string,
}

export const verifyERC20 = async (
  network: ENetwork,
  contractAddress: string,
): Promise<TERC20> => {
  const web3 = new Web3(config.chain.provider.http[network])
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
