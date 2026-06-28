import { Router, type Request, type Response } from 'express'
import type { User, ApiResponse } from '../../shared/index.js'
import { userStorage, bookStorage, favoriteStorage, generateId } from '../utils/storage.js'

const router = Router()

router.post('/register', (req: Request, res: Response) => {
  const { username, password, nickname, phone } = req.body
  const users = userStorage.readAll()

  if (users.find(u => u.username === username)) {
    return res.json({
      success: false,
      message: '用户名已存在',
    } as ApiResponse<null>)
  }

  const newUser: User = {
    id: generateId('user'),
    username,
    password,
    nickname: nickname || username,
    phone,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  userStorage.writeAll(users)

  const { password: _, ...userWithoutPassword } = newUser
  res.json({
    success: true,
    data: userWithoutPassword,
  } as ApiResponse<Omit<User, 'password'>>)
})

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  const users = userStorage.readAll()

  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.json({
      success: false,
      message: '用户名或密码错误',
    } as ApiResponse<null>)
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    data: userWithoutPassword,
  } as ApiResponse<Omit<User, 'password'>>)
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const users = userStorage.readAll()
  const user = users.find(u => u.id === id)

  if (!user) {
    return res.json({
      success: false,
      message: '用户不存在',
    } as ApiResponse<null>)
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    data: userWithoutPassword,
  } as ApiResponse<Omit<User, 'password'>>)
})

router.get('/:id/books', (req: Request, res: Response) => {
  const { id } = req.params
  const books = bookStorage.readAll()
  const userBooks = books.filter(b => b.sellerId === id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  res.json({
    success: true,
    data: userBooks,
  } as ApiResponse<typeof userBooks>)
})

router.get('/:id/favorites', (req: Request, res: Response) => {
  const { id } = req.params
  const favorites = favoriteStorage.readAll()
  const books = bookStorage.readAll()

  const userFavIds = favorites.filter(f => f.userId === id).map(f => f.bookId)
  const favBooks = books.filter(b => userFavIds.includes(b.id)).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  res.json({
    success: true,
    data: favBooks,
  } as ApiResponse<typeof favBooks>)
})

export default router
