import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import { dbService } from './services/db.service.js'
import { workspaceRoute } from './api/workspace/workspace.routes.js'
import { boardRouter } from './api/board/board.routes.js'
import { userRoutes } from './api/users/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'

dotenv.config()

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? '' :
    ['http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}

try {
  dbService.connect()
  console.log('trying to connect DB')
} catch {
  console.error('Cannot Connect to DB')
}

const app = express()
const port = process.env.PORT || 3030

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workspace', workspaceRoute)
app.use('/api/board', boardRouter)
app.use('/api/user', userRoutes)

// app.get('/**', (req, res) => {
//   res.sendFile(path.resolve('public/index.html'))
// })


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})