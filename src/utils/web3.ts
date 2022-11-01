import Web3 from 'web3'

const web3 = new Web3()

export const getMessageHex = (message: string): string => web3.utils.utf8ToHex(message)

export const validateAddress = (address: string): boolean => web3.utils.isAddress(address)

export const validateHex = (hex: string): boolean => web3.utils.isHex(hex)

export const recoverAddress = (messageHex: string, signature: string) => web3.eth.accounts.recover(messageHex, signature).toLowerCase()