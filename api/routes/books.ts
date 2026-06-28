import { Router, type Request, type Response } from 'express'
import type { Book, ApiResponse, AgeGroup } from '../../shared/index.js'
import { bookStorage, userStorage, generateId } from '../utils/storage.js'

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

router.post('/', (req: Request, res: Response) => {
  const { title, author, category, ageGroup, price, isFree, description, condition, images, sellerId } = req.body

  const newBook: Book = {
    id: generateId('book'),
    title,
    author,
    category,
    ageGroup,
    price: isFree ? 0 : price,
    isFree,
    description,
    condition,
    images: images || [],
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

  books.splice(index, 1)
  bookStorage.writeAll(books)

  res.json({
    success: true,
    message: '删除成功',
  } as ApiResponse<null>)
})

export default router
