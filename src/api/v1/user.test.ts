import { Server } from '@hapi/hapi'
import serverCreate from '../../server/index'
import Web3 from 'web3'
import { TOutput } from '..'
import { TUser, userCreate, userGetByAddress, UserModel } from '../../database/user'

describe('User routes', () => {
  let server: Server
  beforeAll(async () => {
    server = await serverCreate()
    await server.start()
  })

  const web3 = new Web3()

  test('Login workflow', async () => {
    const account = web3.eth.accounts.create()
    const messageUrl = '/api/v1/auth/message'
    const messageResponse = await server.inject({
      method: 'GET',
      url: server.info.uri + messageUrl + '?' + new URLSearchParams({ address: account.address }),
    })
    expect(messageResponse).not.toBeNull()
    expect(messageResponse.statusCode).toBe(200)
    expect(messageResponse.result).not.toBeNull()
    expect(typeof messageResponse.result).toBe('object')
    const { result: messageResult, status: messageStatus } = messageResponse.result as TOutput<{ message: string, messageHex: string }>
    expect(messageStatus).toBe(true)
    expect(messageResult).not.toBeNull()
    expect(messageResult).toHaveProperty('message')
    expect(messageResult).toHaveProperty('messageHex')

    const { messageHex } = messageResult!
    const signature = web3.eth.accounts.sign(messageHex, account.privateKey)
    const info = {
      name: 'stepidone',
      dateOfBirth: new Date(),
    }

    const signupUrl = '/api/v1/user/signup'
    const signupResponse = await server.inject({
      method: 'POST',
      url: server.info.uri + signupUrl,
      payload: {
        messageHex,
        signature: signature.signature,
        info,
      },
    })
    expect(signupResponse).not.toBeNull()
    expect(signupResponse.statusCode).toBe(200)
    expect(signupResponse.result).not.toBeNull()
    expect(typeof signupResponse.result).toBe('object')
    const { result: signupResult, status: signupStatus } = signupResponse.result as TOutput<Pick<TUser, 'id' | 'address' | 'name' | 'dateOfBirth'>>
    expect(signupStatus).toBe(true)
    expect(signupResult).not.toBeNull()
    expect(signupResult).toHaveProperty('id')
    expect(signupResult).toHaveProperty('address')
    expect(signupResult).toHaveProperty('name')
    expect(signupResult).toHaveProperty('dateOfBirth')
    expect(typeof signupResult!.id).toBe('string')
    expect(signupResult!.address).toBe(account.address.toLowerCase())
    expect(signupResult!.name).toBe(info.name)
    expect(signupResult!.dateOfBirth).toStrictEqual(info.dateOfBirth)

    const signinUrl = '/api/v1/user/signin'
    const signinResponse = await server.inject({
      method: 'GET',
      url: server.info.uri + signinUrl,
      headers: {
        'message-hex': messageHex,
        signature: signature.signature,
      },
    })

    expect(signinResponse).not.toBeNull()
    expect(signinResponse.statusCode).toBe(200)
    expect(signinResponse.result).not.toBeNull()
    expect(typeof signinResponse.result).toBe('object')
    const { result: signinResult, status: signinStatus } = signinResponse.result as TOutput<Pick<TUser, 'id' | 'address' | 'name' | 'dateOfBirth'>>
    expect(signinStatus).toBe(true)
    expect(signinResult).not.toBeNull()
    expect(signinResult).toHaveProperty('id')
    expect(signinResult).toHaveProperty('address')
    expect(signinResult).toHaveProperty('name')
    expect(signinResult).toHaveProperty('dateOfBirth')
    expect(typeof signinResult!.id).toBe('string')
    expect(signinResult!.address).toBe(account.address.toLowerCase())
    expect(signinResult!.name).toBe(info.name)
    expect(signinResult!.dateOfBirth).toStrictEqual(info.dateOfBirth)
  })

  test('User update', async () => {
    const account = web3.eth.accounts.create()
    const messageUrl = '/api/v1/auth/message'
    const messageResponse = await server.inject({
      method: 'GET',
      url: server.info.uri + messageUrl + '?' + new URLSearchParams({ address: account.address }),
    })

    const userBefore = (await userCreate({ address: account.address.toLowerCase() })).get({ plain: true })
    expect(userBefore).not.toHaveProperty('name')
    expect(userBefore).not.toHaveProperty('dateOfBirth')

    const { result: messageResult } = messageResponse.result as TOutput<{ message: string, messageHex: string }>
    const { messageHex } = messageResult!
    const signature = web3.eth.accounts.sign(messageHex, account.privateKey)
    const info = {
      name: 'stepidone',
      dateOfBirth: new Date(),
    }

    const updateUrl = '/api/v1/user'
    await server.inject({
      method: 'PUT',
      url: server.info.uri + updateUrl,
      headers: {
        'message-hex': messageHex,
        signature: signature.signature,
      },
      payload: info,
    })

    const userAfter = await userGetByAddress(account.address.toLowerCase())
    expect(userAfter).not.toBeNull()
    expect(userAfter.id).toBe(userBefore.id)
    expect(userAfter.address).toBe(userBefore.address)
    expect(userAfter.name).not.toBeNull()
    expect(userAfter.name).toBe(info.name)
    expect(userAfter.dateOfBirth).not.toBeNull()
    expect(userAfter.dateOfBirth).toStrictEqual(info.dateOfBirth)
  })

  test('User delete', async () => {
    const account = web3.eth.accounts.create()
    const messageUrl = '/api/v1/auth/message'
    const messageResponse = await server.inject({
      method: 'GET',
      url: server.info.uri + messageUrl + '?' + new URLSearchParams({ address: account.address }),
    })

    const userBefore = (await userCreate({ address: account.address.toLowerCase() })).get({ plain: true })
    expect(userBefore).not.toBeNull()

    const { result: messageResult } = messageResponse.result as TOutput<{ message: string, messageHex: string }>
    const { messageHex } = messageResult!
    const signature = web3.eth.accounts.sign(messageHex, account.privateKey)

    const deleteUrl = '/api/v1/user'
    await server.inject({
      method: 'DELETE',
      url: server.info.uri + deleteUrl,
      headers: {
        'message-hex': messageHex,
        signature: signature.signature,
      },
    })

    const userAfter = await userGetByAddress(account.address.toLowerCase())
    expect(userAfter).toBeNull()

    const userAfterNonParanoid = await UserModel.findOne({ where: { address: account.address.toLowerCase() }, paranoid: false })
    expect(userAfterNonParanoid).not.toBeNull()
    expect(userAfterNonParanoid?.deletedAt).not.toBeNull()
  })

  afterAll(async () => {
    await server.stop()
  })
})