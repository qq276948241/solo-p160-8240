<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Book } from '../../shared/index.js'
import { Heart } from 'lucide-vue-next'

const props = defineProps<{
  book: Book
}>()

const router = useRouter()

function goDetail() {
  router.push(`/book/${props.book.id}`)
}

function formatAge(group: string) {
  if (group === '0-3') return '0-3岁'
  if (group === '3-6') return '3-6岁'
  return '6岁以上'
}
</script>

<template>
  <div class="card group cursor-pointer animate-fade-in" @click="goDetail">
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img
        v-if="book.cover || book.images?.[0]"
        :src="book.cover || book.images[0]"
        :alt="book.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
        <span class="text-4xl">📚</span>
      </div>
      <div class="absolute top-3 left-3">
        <span v-if="book.isFree" class="tag-free">
          🎁 免费送
        </span>
        <span v-else class="tag-paid">
          ¥{{ book.price }}
        </span>
      </div>
      <div class="absolute top-3 right-3">
        <span class="tag-age">
          {{ formatAge(book.ageGroup) }}
        </span>
      </div>
    </div>

    <div class="p-4">
      <h3 class="font-semibold text-gray-800 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
        {{ book.title }}
      </h3>
      <p class="text-sm text-gray-500 mb-2 line-clamp-1">
        {{ book.author }}
      </p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
          {{ book.category }}
        </span>
        <span class="text-xs text-gray-400">
          {{ book.condition }}
        </span>
      </div>
    </div>
  </div>
</template>
