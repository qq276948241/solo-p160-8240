import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 2 * 1024 * 1024

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `cover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

export const coverUpload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传 JPG/JPEG/PNG 格式图片，且不超过 2MB'))
    }
  },
})

export function resolveCoverPath(coverUrl: string): string {
  return path.join(UPLOAD_DIR, path.basename(coverUrl))
}

export function deleteCoverFile(coverUrl: string): void {
  if (!coverUrl) return
  const filePath = resolveCoverPath(coverUrl)
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath) } catch (_) { /* ignore */ }
  }
}
