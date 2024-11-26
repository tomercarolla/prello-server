import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

dotenv.config()

const cryptr = new Cryptr(process.env.SECRET)

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken
}

async function signup({ username, password, fullname }) {
  const saltRounds = 10

  try {
    const collection = await dbService.getCollection('users')
    const existUser = await collection.findOne({ username })
    if (existUser) throw new Error(`Username ${username} already exists`)
    
    
    const hashPassword = await bcrypt.hash(password, saltRounds)

    const userToSave = {
      username,
      password: hashPassword,
      fullname,
      imgUrl: '',
      isAdmin: (username === 'admin') ? true : false,
      createdAt: Date.now()
    }

    const result = await collection.insertOne(userToSave)
    return { ...userToSave, _id: result.insertedId }
  } catch (err) {
    loggerService.error(`Cannot signup user ${username}`, err)
    throw new Error(`Cannot signup user ${username}`)
  }
}

async function login(username, password) {
  try {
    const collection = await dbService.getCollection('users')
    const user = await collection.findOne({ username })
    if (!user) return null
    
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid username or password')

    const miniUser = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
      isAdmin: user.isAdmin || false
    }
    return miniUser
  } catch (err) {
    loggerService.error(`Cannot login user ${username}`, err)
    throw new Error(`Cannot login user ${username}`)
  }
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    username: user.username,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    isAdmin: user.isAdmin || false
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(token) {
  try {
    const json = cryptr.decrypt(token)
    const loggedinUser = JSON.parse(json) 
    return loggedinUser
  } catch (err) {
    loggerService.error('Error from auth-service, Invalid token', err)
    throw new Error('Invalid token')
  }
}

