<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/utils/request'
import { useAuth } from '@/composables/useAuth'
import BookCard from '@/components/BookCard.vue'
import type { Book } from '../../shared/index.js'
import { User, BookOpen, Heart, LogOut } from 'lucide-vue-next'

const router = useRouter()
const { currentUser, logout } = useAuth()

const activeTab = ref<'books' | 'favorites'>('books')
const myBooks = ref<Book[]>([])
const myFavorites = ref<Book[]>([])
const loading = ref(false)

async function loadMyBooks() {
  if (!currentUser.value) return
  loading.value = true
  try {
    const res = await get<Book[]>(`/api/users/${currentUser.value.id}/books`)
    if (res.success) {
      myBooks.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

async function loadMyFavorites() {
  if (!currentUser.value) return
  loading.value = true
  try {
    const res = await get<Book[]>(`/api/users/${currentUser.value.id}/favorites`)
    if (res.success) {
      myFavorites.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

function switchTab(tab: 'books' | 'favorites') {
  activeTab.value = tab
  if (tab === 'books') {
    loadMyBooks()
  } else {
    loadMyFavorites()
  }
}

function handleLogout() {
  logout()
  router.push('/')
}

onMounted(() => {
  loadMyBooks()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="card p-6 !rounded-3xl mb-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
          <span class="text-2xl font-bold text-white">{{ currentUser?.nickname?.[0] || 'U' }}</span>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-800">{{ currentUser?.nickname }}</h2>
          <p class="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <User class="w-4 h-4" />
            {{ currentUser?.username }}
          </p>
          <p class="text-gray-400 text-sm mt-0.5">📱 {{ currentUser?.phone }}</p>
        </div>
        <button @click="handleLogout" class="btn-ghost text-gray-500 hover:text-red-500 flex items-center gap-1">
          <LogOut class="w-4 h-4" />
          退出
        </button>
      </div>
    </div>

    <div class="flex gap-2 mb-6">
      <button
        @click="switchTab('books')"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
          activeTab === 'books'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        ]"
      >
        <BookOpen class="w-5 h-5" />
        我发布的
        <span class="text-xs px-1.5 py-0.5 rounded-full bg-white/20">{{ myBooks.length }}</span>
      </button>
      <button
        @click="switchTab('favorites')"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
          activeTab === 'favorites'
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        ]"
      >
        <Heart class="w-5 h-5" />
        我的收藏
        <span class="text-xs px-1.5 py-0.5 rounded-full bg-white/20">{{ myFavorites.length }}</span>
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      <div v-for="i in 4" :key="i" class="card animate-pulse">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'books' && myBooks.length === 0" class="text-center py-20 bg-white rounded-2xl">
      <div class="text-6xl mb-4">📚</div>
      <p class="text-gray-500">你还没有发布过绘本</p>
      <button @click="router.push('/publish')" class="btn-primary mt-4">
        去发布一本
      </button>
    </div>

    <div v-else-if="activeTab === 'favorites' && myFavorites.length === 0" class="text-center py-20 bg-white rounded-2xl">
      <div class="text-6xl mb-4">💝</div>
      <p class="text-gray-500">还没有收藏的绘本</p>
      <button @click="router.push('/')" class="btn-primary mt-4">
        去逛逛
      </button>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      <BookCard
        v-for="book in (activeTab === 'books' ? myBooks : myFavorites)"
        :key="book.id"
        :book="book"
      />
    </div>
  </div>
</template>
