<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { post } from '@/utils/request'
import { useAuth, type CurrentUser } from '@/composables/useAuth'
import { BookOpen, User, Lock } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { setUser } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await post<CurrentUser>('/api/users/login', {
      username: username.value,
      password: password.value,
    })
    if (res.success && res.data) {
      setUser(res.data)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      errorMsg.value = res.message || '登录失败'
    }
  } finally {
    loading.value = false
  }
}

function goRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
          <BookOpen class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800">欢迎回来</h1>
        <p class="text-gray-500 mt-2">登录账号，发现更多好绘本</p>
      </div>

      <div class="card p-6 sm:p-8 !rounded-3xl">
        <div class="space-y-5">
          <div>
            <label class="form-label">用户名</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                class="input-field pl-10"
                @keydown.enter="handleLogin"
              />
            </div>
          </div>

          <div>
            <label class="form-label">密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                class="input-field pl-10"
                @keydown.enter="handleLogin"
              />
            </div>
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm text-center">
            {{ errorMsg }}
          </p>

          <button
            @click="handleLogin"
            :disabled="loading"
            class="btn-primary w-full !py-3 text-base"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </button>

          <div class="text-center text-sm text-gray-500 pt-2">
            还没有账号？
            <button @click="goRegister" class="text-primary-500 hover:text-primary-600 font-medium ml-1">
              立即注册
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center text-sm text-gray-400">
        <p>测试账号：parent1 / 123456</p>
      </div>
    </div>
  </div>
</template>
