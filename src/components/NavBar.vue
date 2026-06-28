<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { BookOpen, User, PlusCircle, LogOut, Search } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { currentUser, isLoggedIn, logout } = useAuth()

function handleLogout() {
  logout()
  router.push('/')
}

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/login')
}

function goPublish() {
  router.push('/publish')
}

function goMine() {
  router.push('/mine')
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-2 cursor-pointer group" @click="goHome">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <BookOpen class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            绘本漂流
          </span>
        </div>

        <div class="hidden md:flex items-center gap-1 flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索绘本名称、作者..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              @keydown.enter="(e) => {
                const target = e.target as HTMLInputElement
                router.push({ name: 'home', query: { keyword: target.value } })
              }"
              :value="(route.query.keyword as string) || ''"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="isLoggedIn">
            <button @click="goPublish" class="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm">
              <PlusCircle class="w-4 h-4" />
              <span class="hidden sm:inline">发布绘本</span>
            </button>
            <button @click="goMine" class="btn-ghost flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-600 text-sm font-medium">{{ currentUser?.nickname?.[0] || 'U' }}</span>
              </div>
              <span class="hidden sm:inline text-sm">{{ currentUser?.nickname }}</span>
            </button>
            <button @click="handleLogout" class="btn-ghost !p-2" title="退出登录">
              <LogOut class="w-5 h-5 text-gray-500" />
            </button>
          </template>
          <template v-else>
            <button @click="goLogin" class="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm">
              <User class="w-4 h-4" />
              登录
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
