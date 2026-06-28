<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post, del } from '@/utils/request'
import { useAuth } from '@/composables/useAuth'
import type { BookWithSeller, MessageWithUser, AgeGroup } from '../../shared/index.js'
import { Heart, MessageCircle, Phone, User, Send, ArrowLeft, Gift, Tag } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { currentUser, isLoggedIn } = useAuth()

const book = ref<BookWithSeller | null>(null)
const messages = ref<MessageWithUser[]>([])
const isFavorited = ref(false)
const newMessage = ref('')
const submittingMsg = ref(false)
const loading = ref(false)

function formatAge(group: AgeGroup) {
  if (group === '0-3') return '0-3岁'
  if (group === '3-6') return '3-6岁'
  return '6岁以上'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const bookId = computed(() => route.params.id as string)

async function loadBook() {
  loading.value = true
  try {
    const res = await get<BookWithSeller>(`/api/books/${bookId.value}`)
    if (res.success && res.data) {
      book.value = res.data
    }
  } finally {
    loading.value = false
  }
}

async function loadMessages() {
  const res = await get<MessageWithUser[]>(`/api/messages/book/${bookId.value}`)
  if (res.success) {
    messages.value = res.data || []
  }
}

async function checkFavorite() {
  if (!isLoggedIn.value || !currentUser.value) return
  const res = await get<boolean>('/api/favorites/check', {
    userId: currentUser.value.id,
    bookId: bookId.value,
  })
  if (res.success) {
    isFavorited.value = res.data || false
  }
}

async function toggleFavorite() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (isFavorited.value) {
    const res = await del('/api/favorites', {
      userId: currentUser.value?.id,
      bookId: bookId.value,
    })
    if (res.success) isFavorited.value = false
  } else {
    const res = await post('/api/favorites', {
      userId: currentUser.value?.id,
      bookId: bookId.value,
    })
    if (res.success) isFavorited.value = true
  }
}

async function submitMessage() {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (!newMessage.value.trim()) return
  submittingMsg.value = true
  try {
    const res = await post('/api/messages', {
      userId: currentUser.value?.id,
      bookId: bookId.value,
      content: newMessage.value.trim(),
    })
    if (res.success) {
      newMessage.value = ''
      await loadMessages()
    }
  } finally {
    submittingMsg.value = false
  }
}

onMounted(() => {
  loadBook()
  loadMessages()
  checkFavorite()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.back()" class="btn-ghost !px-0 flex items-center gap-2 text-gray-600 mb-6">
      <ArrowLeft class="w-4 h-4" />
      返回列表
    </button>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
    </div>

    <template v-else-if="book">
      <div class="grid md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="card !rounded-3xl overflow-hidden">
            <div class="aspect-square bg-gray-100 relative">
              <img
                v-if="book.images?.[0]"
                :src="book.images[0]"
                :alt="book.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <span class="text-8xl">📚</span>
              </div>
              <div class="absolute top-4 left-4 flex gap-2">
                <span v-if="book.isFree" class="tag-free text-base px-4 py-1.5">
                  <Gift class="w-4 h-4 inline mr-1" />免费送
                </span>
                <span v-else class="tag-paid text-base px-4 py-1.5">
                  <Tag class="w-4 h-4 inline mr-1" />¥{{ book.price }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="book.images && book.images.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="(img, idx) in book.images"
              :key="idx"
              class="aspect-square rounded-xl overflow-hidden bg-gray-100"
            >
              <img :src="img" :alt="`${book.title}-${idx}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{{ book.title }}</h1>
            <p class="text-gray-500 mb-4">作者：{{ book.author }}</p>

            <div class="flex flex-wrap gap-2 mb-4">
              <span class="tag-age">{{ formatAge(book.ageGroup) }}</span>
              <span class="tag bg-purple-100 text-purple-700">{{ book.category }}</span>
              <span class="tag bg-orange-100 text-orange-700">{{ book.condition }}</span>
            </div>

            <p class="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              {{ book.description }}
            </p>
          </div>

          <div class="card p-5 !rounded-2xl">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User class="w-6 h-6 text-primary-600" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ book.seller.nickname }}</p>
                <p class="text-sm text-gray-400">
                  发布于 {{ formatDate(book.createdAt) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 text-gray-600 bg-blue-50 p-3 rounded-xl mb-4">
              <Phone class="w-5 h-5 text-blue-500" />
              <span>联系方式：</span>
              <span class="font-semibold text-blue-600">{{ book.seller.phone }}</span>
            </div>

            <div class="flex gap-3">
              <button
                @click="toggleFavorite"
                :class="[
                  'flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                  isFavorited
                    ? 'bg-red-50 text-red-500 border-2 border-red-200'
                    : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                ]"
              >
                <Heart :class="['w-5 h-5', isFavorited ? 'fill-red-500' : '']" />
                {{ isFavorited ? '已收藏' : '收藏' }}
              </button>
              <a
                :href="`tel:${book.seller.phone}`"
                class="btn-primary flex-1 flex items-center justify-center gap-2 !py-3"
              >
                <Phone class="w-5 h-5" />
                联系卖家
              </a>
            </div>
          </div>

          <div class="card p-5 !rounded-2xl">
            <div class="flex items-center gap-2 mb-4">
              <MessageCircle class="w-5 h-5 text-primary-500" />
              <h3 class="font-semibold text-gray-800">留言咨询</h3>
              <span class="text-sm text-gray-400">({{ messages.length }})</span>
            </div>

            <div v-if="messages.length === 0" class="text-center py-6 text-gray-400 text-sm">
              还没有留言，来问问卖家吧~
            </div>

            <div v-else class="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="[
                  'p-3 rounded-xl',
                  msg.userId === currentUser?.id ? 'bg-primary-50 ml-8' : 'bg-gray-50 mr-8'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ msg.user.nickname }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(msg.createdAt) }}</span>
                </div>
                <p class="text-gray-600 text-sm">{{ msg.content }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <input
                v-model="newMessage"
                type="text"
                :placeholder="isLoggedIn ? '输入留言内容...' : '登录后才能留言哦'"
                class="input-field !py-2.5 flex-1"
                @keydown.enter="submitMessage"
              />
              <button
                @click="submitMessage"
                :disabled="submittingMsg || !newMessage.trim() || !isLoggedIn"
                class="btn-primary !px-4 !py-2.5"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <p class="text-gray-500">绘本不存在或已下架</p>
    </div>
  </div>
</template>
