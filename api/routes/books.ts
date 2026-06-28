import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import type { Book, ApiResponse, AgeGroup } from '../../shared/index.js'
import { bookStorage, userStorage, generateId } from '../utils/storage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `cover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传 JPG/JPEG/PNG 格式图片，且不超过 2MB'))
    }
  },
})

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { ageGroup = 'all', type = 'all', keyword = '' } = req.query
  let books = bookStorage.readAll()

  if (ageGroup !== 'all') {
    books = books.filter(b => b.ageGroup === ageGroup as AgeGroup)
  }

  if (type === 'free') {
    books = books.filter(b => b.isFree)
  } else if (type === 'paid') {
    books = books.filter(b => !b.isFree)
  }

  if (keyword) {
    const kw = String(keyword).toLowerCase()
    books = books.filter(b =>
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      b.category.toLowerCase().includes(kw)
    )
  }

  books = books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json({
    success: true,
    data: books,
  } as ApiResponse<Book[]>)
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const books = bookStorage.readAll()
  const users = userStorage.readAll()

  const book = books.find(b => b.id === id)
  if (!book) {
    return res.json({
      success: false,
      message: '绘本不存在',
    } as ApiResponse<null>)
  }

  const seller = users.find(u => u.id === book.sellerId)
  if (!seller) {
    return res.json({
      success: false,
      message: '卖家不存在',
    } as ApiResponse<null>)
  }

  const { password: _, ...sellerWithoutPassword } = seller

  res.json({
    success: true,
    data: {
      ...book,
      seller: sellerWithoutPassword,
    },
  } as ApiResponse<Book & { seller: Omit<typeof seller, 'password'> }>)
})

router.post('/', upload.single('cover'), (req: Request, res: Response) => {
  const { title, author, category, ageGroup, price, isFree, description, condition, sellerId } = req.body

  if (!title || !author || !description || !sellerId) {
    return res.json({
      success: false,
      message: '请填写必要字段',
    } as ApiResponse<null>)
  }

  let cover = ''
  if (req.file) {
    cover = `/uploads/${req.file.filename}`
  }

  const newBook: Book = {
    id: generateId('book'),
    title,
    author,
    category: category || '其他',
    ageGroup,
    price: isFree === 'true' || isFree === true ? 0 : Number(price) || 0,
    isFree: isFree === 'true' || isFree === true,
    description,
    condition: condition || '九成新',
    cover,
    images: cover ? [cover] : [],
    sellerId,
    createdAt: new Date().toISOString(),
  }

  const books = bookStorage.readAll()
  books.push(newBook)
  bookStorage.writeAll(books)

  res.json({
    success: true,
    data: newBook,
  } as ApiResponse<Book>)
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const books = bookStorage.readAll()
  const index = books.findIndex(b => b.id === id)

  if (index === -1) {
    return res.json({
      success: false,
      message: '绘本不存在',
    } as ApiResponse<null>)
  }

  const deleted = books[index]
  books.splice(index, 1)
  bookStorage.writeAll(books)

  if (deleted.cover) {
    const coverPath = path.join(UPLOAD_DIR, path.basename(deleted.cover))
    if (fs.existsSync(coverPath)) {
      try { fs.unlinkSync(coverPath) } catch (_) { /* ignore */ }
    }
  }

  res.json({
    success: true,
    message: '删除成功',
  } as ApiResponse<null>)
})

export default router
