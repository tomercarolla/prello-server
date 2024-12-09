import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { workspaceRoute } from './api/workspace/workspace.routes.js'
import { boardRouter } from './api/board/board.routes.js'
import { userRoutes } from './api/users/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env') })

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(resolve(__dirname, 'public')))
} else {
  const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoute);
app.use('/api/board', boardRouter);
app.use('/api/user', userRoutes);

app.get('/**', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'))
})

// app.get('/**', (req, res) => {
//   res.sendFile(path.resolve('public/index.html'));
// });

const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});