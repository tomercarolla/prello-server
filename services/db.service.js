import { MongoClient, ObjectId } from 'mongodb'
import { config } from '../config/index.js'
import { loggerService } from './logger.service.js'

let dbConn = null

export const dbService = {
  getCollection,
  connect: connectToDB,
  initializeDB     
}

async function connectToDB() {
  try {
    if (!dbConn) {
      const client = await MongoClient.connect(config.dbURL)
      dbConn = client.db(config.dbName)
      console.log('Connected to MongoDB successfully')
    }
    return dbConn
  } catch (err) {
    console.error('Cannot connect to MongoDB', err) 
    throw new Error('Cannot connect to MongoDB')
  }
}

async function getCollection(collectionName) {
  try {
    const db = await connectToDB()
    const collection = db.collection(collectionName)
    return collection
  } catch (err) {
    loggerService.error('Cannot connect to DB', err)
    throw new Error('Cannot connect to DB')
  }
}