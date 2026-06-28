<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '@/utils/request'
import { useAuth, type CurrentUser } from '@/composables/useAuth'
import { BookOpen, User, Lock, Phone, Smile } from 'lucide-vue-next'

const router = useRouter()
const { setUser } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const phone = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  if (!username.value || !password.value || !nickname.value || !phone.value) {
    errorMsg.value = '请填写所有必填项'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码输入不一致'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = '密码至少6位'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await post<CurrentUser>('/api/users/register', {
      username: username.value,
      password: password.value,
      nickname: nickname.value,
      phone: phone.value,
    })
    if (res.success && res.data) {
      setUser(res.data)
      router.push('/')
    } else {
      errorMsg.value = res.message || '注册失败'
    }
  } finally {
    loading.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
          <BookOpen class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800">创建账号</h1>
        <p class="text-gray-500 mt-2">加入绘本漂流，分享与发现</p>
      </div>

      <div class="card p-6 sm:p-8 !rounded-3xl">
        <div class="space-y-4">
          <div>
            <label class="form-label">用户名 <span class="text-red-400">*</span></label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="username"
                type="text"
                placeholder="用于登录的用户名"
                class="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label class="form-label">昵称 <span class="text-red-400">*</span></label>
            <div class="relative">
              <Smile class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="nickname"
                type="text"
                placeholder="显示给其他用户的昵称"
                class="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label class="form-label">手机号 <span class="text-red-400">*</span></label>
            <div class="relative">
              <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="phone"
                type="tel"
                placeholder="方便卖家联系您"
                class="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label class="form-label">密码 <span class="text-red-400">*</span></label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="password"
                type="password"
                placeholder="至少6位"
                class="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label class="form-label">确认密码 <span class="text-red-400">*</span></label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                class="input-field pl-10"
                @keydown.enter="handleRegister"
              />
            </div>
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm text-center">
            {{ errorMsg }}
          </p>

          <button
            @click="handleRegister"
            :disabled="loading"
            class="btn-primary w-full !py-3 text-base"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </button>

          <div class="text-center text-sm text-gray-500 pt-2">
            已有账号？
            <button @click="goLogin" class="text-primary-500 hover:text-primary-600 font-medium ml-1">
              去登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
