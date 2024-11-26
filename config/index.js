import dotenv from 'dotenv'

dotenv.config()

const config = {
    dbURL: process.env.MONGO_URL,
    dbName: 'prello-db',
}
  
export { config }