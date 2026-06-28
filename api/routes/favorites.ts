import { Router, type Request, type Response } from 'express'
import type { Favorite, ApiResponse } from '../../shared/index.js'
import { favoriteStorage, generateId } from '../utils/storage.js'

const router = Router()

router.get('/check', (req: Request, res: Response) => {
  const { userId, bookId } = req.query
  const favorites = favoriteStorage.readAll()
  const exists = favorites.some(f => f.userId === userId && f.bookId === bookId)

  res.json({
    success: true,
    data: exists,
  } as ApiResponse<boolean>)
})

router.post('/', (req: Request, res: Response) => {
  const { userId, bookId } = req.body
  const favorites = favoriteStorage.readAll()

  const exists = favorites.find(f => f.userId === userId && f.bookId === bookId)
  if (exists) {
    return res.json({
      success: true,
      message: '已收藏',
    } as ApiResponse<null>)
  }

  const newFav: Favorite = {
    id: generateId('fav'),
    userId,
    bookId,
    createdAt: new Date().toISOString(),
  }

  favorites.push(newFav)
  favoriteStorage.writeAll(favorites)

  res.json({
    success: true,
    message: '收藏成功',
  } as ApiResponse<null>)
})

router.delete('/', (req: Request, res: Response) => {
  const { userId, bookId } = req.body
  const favorites = favoriteStorage.readAll()
  const index = favorites.findIndex(f => f.userId === userId && f.bookId === bookId)

  if (index === -1) {
    return res.json({
      success: false,
      message: '未收藏',
    } as ApiResponse<null>)
  }

  favorites.splice(index, 1)
  favoriteStorage.writeAll(favorites)

  res.json({
    success: true,
    message: '取消收藏成功',
  } as ApiResponse<null>)
})

export default router
