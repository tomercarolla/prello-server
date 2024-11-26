import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
// import { asyncLocalStorage } from '../../services/als.service.js'

export const workspaceService = {
  query,
  getById,
  remove,
  save,
}

async function query() {
  try {

  } catch (err) {
    
  }
}

async function getById(workspaceId) {
  try {
    const collection = await dbService.getCollection('workspaces')
    const objId = ObjectId.createFromHexString(workspaceId)
    const workspace = await collection.findOne({ _id: objId })
    return workspace
  } catch (err) {
    loggerService.error('cannot find workspace', err)
    throw new Error('cannot find workspace')
  }
}

async function remove() {
  try {
    const collection = await dbService.getCollection('workspaces')
    const objId = await collection.findOne({ _id: ObjectId.createFromHexString(workspaceId) })

    if (!objId) throw new Error(`cannot remove workspace ${workspaceId}`)

    await collection.deleteOne({ _id: objId })  
  } catch (err) {
    loggerService.error(`Cannot remove workspace ${workspaceId}`, err)
    throw new Error('cannot remove workspace') 
  }
}

async function save() {
  try {

  } catch (err) {
    
  }
}