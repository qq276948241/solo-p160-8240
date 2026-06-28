import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { User, Book, Favorite, Message } from '../../shared/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', 'data')

function getDataPath(filename: string): string {
  return path.join(DATA_DIR, filename)
}

function readJSON<T>(filename: string): T[] {
  const filePath = getDataPath(filename)
  if (!fs.existsSync(filePath)) {
    return []
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T[]
  } catch {
    return []
  }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = getDataPath(filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const userStorage = {
  readAll: (): User[] => readJSON<User>('users.json'),
  writeAll: (data: User[]) => writeJSON<User>('users.json', data),
}

export const bookStorage = {
  readAll: (): Book[] => readJSON<Book>('books.json'),
  writeAll: (data: Book[]) => writeJSON<Book>('books.json', data),
}

export const favoriteStorage = {
  readAll: (): Favorite[] => readJSON<Favorite>('favorites.json'),
  writeAll: (data: Favorite[]) => writeJSON<Favorite>('favorites.json', data),
}

export const messageStorage = {
  readAll: (): Message[] => readJSON<Message>('messages.json'),
  writeAll: (data: Message[]) => writeJSON<Message>('messages.json', data),
}
