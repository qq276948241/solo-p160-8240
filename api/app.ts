import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import userRoutes from './routes/users.js'
import bookRoutes from './routes/books.js'
import favoriteRoutes from './routes/favorites.js'
import messageRoutes from './routes/messages.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads')
app.use('/uploads', express.static(UPLOAD_DIR))

app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/messages', messageRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: '图片不能超过 2MB',
      })
      return
    }
    res.status(400).json({
      success: false,
      message: error.message,
    })
    return
  }
  if (error.message && error.message.includes('只允许上传')) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
    return
  }
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
