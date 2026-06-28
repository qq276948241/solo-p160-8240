import { Router, type Request, type Response } from 'express'
import type { Message, ApiResponse } from '../../shared/index.js'
import { messageStorage, userStorage, generateId } from '../utils/storage.js'

const router = Router()

router.get('/book/:bookId', (req: Request, res: Response) => {
  const { bookId } = req.params
  const messages = messageStorage.readAll()
  const users = userStorage.readAll()

  const bookMessages = messages
    .filter(m => m.bookId === bookId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(m => {
      const user = users.find(u => u.id === m.userId)
      const { password: _, ...userWithoutPassword } = user || { id: m.userId, username: '未知', nickname: '未知', phone: '', createdAt: '' }
      return {
        ...m,
        user: userWithoutPassword,
      }
    })

  res.json({
    success: true,
    data: bookMessages,
  } as ApiResponse<typeof bookMessages>)
})

router.post('/', (req: Request, res: Response) => {
  const { userId, bookId, content } = req.body

  if (!userId || !bookId || !content || !String(content).trim()) {
    return res.json({
      success: false,
      message: '请填写留言内容',
    } as ApiResponse<null>)
  }

  const newMsg: Message = {
    id: generateId('msg'),
    userId,
    bookId,
    content: String(content).trim(),
    createdAt: new Date().toISOString(),
  }

  const messages = messageStorage.readAll()
  messages.push(newMsg)
  messageStorage.writeAll(messages)

  res.json({
    success: true,
    data: newMsg,
  } as ApiResponse<Message>)
})

export default router
