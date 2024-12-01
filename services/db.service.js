import { MongoClient, ObjectId } from 'mongodb'
import { config } from '../config/index.js'
import { loggerService } from './logger.service.js'

let dbConn = null

export const dbService = {
  getCollection,
  connect: connectToDB,
  initializeDB     
}

async function initializeDB() {
  try {
    const collection = await getCollection('boards')
    const existingBoard = await collection.findOne({ 
      _id: ObjectId.createFromHexString('67361fa700b5818e0b9c1525') 
    })
    
    if (existingBoard) return

    const board = {
      _id: ObjectId.createFromHexString('67361fa700b5818e0b9c1525'),
      title: "puki's board",
      isStarred: false,
      archivedAt: null,
      createdBy: {
        _id: "67361f6100b5818e0b9c1524",
        fullname: "puki",
        imgUrl: ""
      },
      style: { backgroundImage: "" },
      labels: [
        {
          id: "l101",
          title: "Done",
          color: "#61bd4f"
        },
        {
          id: "l102", 
          title: "in progress",
          color: "#f2d600"
        },
        {
          id: "l225",
          title: "Waiting",
          color: "#ff9f1a"
        }
      ],
      members: [{
        _id: "67361f6100b5818e0b9c1524",
        fullname: "puki",
        imgUrl: ""
      }],
      groups: [
        {
          id: "g101",
          title: "Group 1",
          archivedAt: "1589983468418",
          tasks: [
            {
              id: "c101",
              title: "Replace logo"
            },
            {
              id: "c102", 
              title: "Add Samples"
            }
          ]
        },
        {
          id: "g102",
          title: "Group 2",
          tasks: [
            {
              id: "c103",
              title: "Do that",
              description: "description",
              labelIds: ["l101", "l102"]
            }
          ]
        }
      ],
      activities: [],
      createdAt: 1731600295681
    }
    
    await collection.insertOne(board)
    console.log('Initial board created')
  } catch (err) {
    console.error('Failed to initialize DB:', err)
    throw err
  }
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