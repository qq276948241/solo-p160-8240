<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import type { Book, AgeGroup } from '../../shared/index.js'
import { get } from '@/utils/request'
import { Sparkles } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const books = ref<Book[]>([])
const loading = ref(false)

type AgeFilter = 'all' | AgeGroup
type TypeFilter = 'all' | 'free' | 'paid'

const ageFilter = ref<AgeFilter>('all')
const typeFilter = ref<TypeFilter>('all')

const ageOptions: { value: AgeFilter; label: string; emoji: string }[] = [
  { value: 'all', label: '全部', emoji: '👶' },
  { value: '0-3', label: '0-3岁', emoji: '🍼' },
  { value: '3-6', label: '3-6岁', emoji: '🧸' },
  { value: '6+', label: '6岁以上', emoji: '📖' },
]

const keyword = computed(() => (route.query.keyword as string) || '')

async function loadBooks() {
  loading.value = true
  try {
    const res = await get<Book[]>('/api/books', {
      ageGroup: ageFilter.value,
      type: typeFilter.value,
      keyword: keyword.value || undefined,
    })
    if (res.success) {
      books.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

function updateQuery() {
  router.replace({
    name: 'home',
    query: {
      ...(ageFilter.value !== 'all' ? { age: ageFilter.value } : {}),
      ...(typeFilter.value !== 'all' ? { type: typeFilter.value } : {}),
      ...(keyword.value ? { keyword: keyword.value } : {}),
    },
  })
}

watch([ageFilter, typeFilter], () => {
  updateQuery()
  loadBooks()
})

watch(() => route.query, () => {
  if (route.query.age) ageFilter.value = route.query.age as AgeFilter
  if (route.query.type) typeFilter.value = route.query.type as TypeFilter
  loadBooks()
}, { immediate: true })

onMounted(() => {
  if (route.query.age) ageFilter.value = route.query.age as AgeFilter
  if (route.query.type) typeFilter.value = route.query.type as TypeFilter
  loadBooks()
})
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div class="flex items-center gap-3 mb-4">
          <Sparkles class="w-8 h-8" />
          <h1 class="text-3xl sm:text-4xl font-bold">小区绘本漂流站</h1>
        </div>
        <p class="text-lg text-white/90 max-w-xl">
          把孩子看过的绘本分享给邻居家的小朋友，让每一本书都能继续传递爱与知识 📖
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
      <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div class="mb-5">
          <p class="text-sm text-gray-500 mb-3">按年龄段筛选</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in ageOptions"
              :key="opt.value"
              @click="ageFilter = opt.value"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                ageFilter === opt.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <span class="mr-1">{{ opt.emoji }}</span>
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4 pt-4 border-t border-gray-100">
          <span class="text-sm text-gray-500">交易类型：</span>
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button
              @click="typeFilter = 'all'"
              :class="[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                typeFilter === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
              ]"
            >
              全部
            </button>
            <button
              @click="typeFilter = 'free'"
              :class="[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                typeFilter === 'free' ? 'bg-white shadow text-green-600' : 'text-gray-500'
              ]"
            >
              🎁 免费送
            </button>
            <button
              @click="typeFilter = 'paid'"
              :class="[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                typeFilter === 'paid' ? 'bg-white shadow text-primary-600' : 'text-gray-500'
              ]"
            >
              💰 付费转让
            </button>
          </div>

          <div class="ml-auto text-sm text-gray-500">
            共 <span class="font-semibold text-primary-600">{{ books.length }}</span> 本绘本
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 8" :key="i" class="card animate-pulse">
          <div class="aspect-square bg-gray-200"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div v-else-if="books.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-gray-500 text-lg">暂时没有符合条件的绘本</p>
        <p class="text-gray-400 text-sm mt-2">换个筛选条件试试，或者自己发布一本吧~</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </div>
  </div>
</template>
