<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { Book } from '../../shared/index.js'
import BookForm from '@/components/BookForm.vue'
import { BookOpen, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const { currentUser } = useAuth()

function onBookCreated(book: Book) {
  router.push(`/book/${book.id}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <button @click="router.back()" class="btn-ghost !px-0 flex items-center gap-2 text-gray-600 mb-6">
      <ArrowLeft class="w-4 h-4" />
      返回
    </button>

    <div class="text-center mb-8">
      <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
        <BookOpen class="w-7 h-7 text-white" />
      </div>
      <h1 class="text-2xl font-bold text-gray-800">发布绘本</h1>
      <p class="text-gray-500 mt-1">让闲置的绘本继续漂流~</p>
    </div>

    <div class="card p-6 sm:p-8 !rounded-3xl">
      <BookForm :seller-id="currentUser?.id || ''" @submit="onBookCreated" />
    </div>
  </div>
</template>
