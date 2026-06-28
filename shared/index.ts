export type AgeGroup = '0-3' | '3-6' | '6+'

export interface User {
  id: string
  username: string
  password: string
  nickname: string
  phone: string
  createdAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  category: string
  ageGroup: AgeGroup
  price: number
  isFree: boolean
  description: string
  condition: string
  images: string[]
  sellerId: string
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  bookId: string
  createdAt: string
}

export interface Message {
  id: string
  userId: string
  bookId: string
  content: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface BookWithSeller extends Book {
  seller: Omit<User, 'password'>
}

export interface MessageWithUser extends Message {
  user: Omit<User, 'password'>
}
