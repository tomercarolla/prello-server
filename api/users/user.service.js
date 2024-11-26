import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'
import { asyncLocalStorage } from '../../services/als.service.js'


export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  save
}

async function query(filterBy = {}) {
  try {
    const criteria = buildCriteria(filterBy)
    const collection = await dbService.getCollection('users')
    const users = await collection.find(criteria).toArray()

    users.forEach(user => delete user.password)
    return users

  } catch (err) {
    loggerService.error('cannot find users', err)
    throw new Error('cannot find users')
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('users')
    const user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
    if (!user) throw new Error('User not found')
    
    delete user.password
    return user
  } catch (err) {
    loggerService.error('cannot find user', err)
    throw new Error('cannot find user')
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('users')
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    loggerService.error('cannot find user', err)
    throw new Error('cannot find user')
  }
}

async function remove(userId) {
  const { loggedinUser } = asyncLocalStorage.getStore()
  try {
    if (!loggedinUser.isAdmin) throw new Error('Unauthorized')
    const collection = await dbService.getCollection('users')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
  } catch(err) {
    loggerService.error('Failed to remove user ${userId}', err) 
    throw new Error('Failed to delete user')
  }
}

async function save(userToSave) {
  try {

    const userToInsert = {
      username: userToSave.username,
      password: userToSave.password,
      fullname: userToSave.fullname,
      imgUrl: userToSave.imgUrl || '',
      isAdmin: userToSave.isAdmin || false,
      createdAt: userToSave.createdAt || Date.now()
    }

    const collection = await dbService.getCollection('users')

    if (userToSave._id) {
      const userId = ObjectId.createFromHexString(userToSave._id)

      const miniUser = {
        username: userToInsert.username,
        fullname: userToInsert.fullname,
        imgUrl: userToInsert.imgUrl,
        isAdmin: userToInsert.isAdmin
      }

      await collection.updateOne(
        { _id: userId },
        { $set: miniUser }
      )
      return { ...miniUser, _id: userToSave._id }
    } else {
      // Create new user
      const result = await collection.insertOne(userToInsert)
      
      const miniUser = {
        username: userToInsert.username,
        fullname: userToInsert.fullname,
        imgUrl: userToInsert.imgUrl,
        isAdmin: userToInsert.isAdmin,
        createdAt: userToInsert.createdAt
      }

      return { ...miniUser, _id: result.insertedId }
    }
  } catch (err) {
    loggerService.error('cannot save user', err)
    throw new Error('cannot save user')
  }
}

function buildCriteria(filterBy) {
  const criteria = {}

  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      { username: txtCriteria },
      { fullname: txtCriteria }
    ]
  }
  return criteria
}