import { userService } from './user.service.js'
import { loggerService } from '../../services/logger.service.js'


export async function getCurrentUser(req, res) {
  try {
    const userId = req.loggedinUser._id

    const user = await userService.getById(userId)
    if (!user) throw new Error('User not found')
    
    res.json(user)
  } catch (err) {
    loggerService.error('Failed to get current user', err)
    res.status(500).send('Failed to get current user')
  }
}

//GetUsers - Admin only
export async function getUsers(req, res) {
  try {
    if (!req.loggedinUser.isAdmin) throw new Error('Unauthorized')
    
    const filterBy = {
      txt: req.query?.txt || '',
    } 

    const users = await userService.query(filterBy)
    res.json(users)
  } catch (err) {
    loggerService.error('Failed to get users', err)
    res.status(500).send({ error: 'Failed to get users' })
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.userId
    const user = await userService.getById(userId)
    res.json(user)
  } catch (err) {
    loggerService.error('Failed to get user', err)
    res.status(500).send({ error: 'Failed to get user' })
  }
}

export async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send('User deleted successfully')
  } catch (err) {
    loggerService.error('Failed to delete user', err)
    res.status(500).send({ error: 'Failed to delete user' })
  }
}

export async function updateUser(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.save(user)
    res.json(savedUser)
  } catch (err) {
    loggerService.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}

