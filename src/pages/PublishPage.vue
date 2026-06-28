<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post } from '@/utils/request'
import { useAuth } from '@/composables/useAuth'
import type { AgeGroup, Book } from '../../shared/index.js'
import { Upload, BookOpen, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const { currentUser } = useAuth()

const title = ref('')
const author = ref('')
const category = ref('启蒙认知')
const ageGroup = ref<AgeGroup>('0-3')
const isFree = ref(true)
const price = ref<number>(0)
const condition = ref('九成新')
const description = ref('')
const images = ref<string[]>([])
const imageUrl = ref('')
const loading = ref(false)
const errorMsg = ref('')

const categories = ['启蒙认知', '情感成长', '习惯养成', '科普百科', '文学故事', '艺术创意', '其他']
const ageOptions: { value: AgeGroup; label: string }[] = [
  { value: '0-3', label: '0-3岁' },
  { value: '3-6', label: '3-6岁' },
  { value: '6+', label: '6岁以上' },
]
const conditions = ['全新', '九成新', '八成新', '七成新', '有磨损']

function addImage() {
  if (imageUrl.value.trim()) {
    images.value.push(imageUrl.value.trim())
    imageUrl.value = ''
  }
}

function removeImage(idx: number) {
  images.value.splice(idx, 1)
}

async function handleSubmit() {
  if (!title.value || !author.value || !description.value) {
    errorMsg.value = '请填写绘本标题、作者和描述'
    return
  }
  if (!isFree.value && (!price.value || price.value <= 0)) {
    errorMsg.value = '请输入正确的价格'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await post<Book>('/api/books', {
      title: title.value,
      author: author.value,
      category: category.value,
      ageGroup: ageGroup.value,
      isFree: isFree.value,
      price: isFree.value ? 0 : price.value,
      condition: condition.value,
      description: description.value,
      images: images.value,
      sellerId: currentUser.value?.id,
    })
    if (res.success && res.data) {
      router.push(`/book/${res.data.id}`)
    } else {
      errorMsg.value = res.message || '发布失败'
    }
  } finally {
    loading.value = false
  }
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
      <div class="space-y-5">
        <div>
          <label class="form-label">绘本标题 <span class="text-red-400">*</span></label>
          <input
            v-model="title"
            type="text"
            placeholder="例如：好饿的毛毛虫"
            class="input-field"
          />
        </div>

        <div>
          <label class="form-label">作者 <span class="text-red-400">*</span></label>
          <input
            v-model="author"
            type="text"
            placeholder="例如：艾瑞·卡尔"
            class="input-field"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">分类</label>
            <select v-model="category" class="input-field">
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">品相</label>
            <select v-model="condition" class="input-field">
              <option v-for="c in conditions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">适合年龄段</label>
          <div class="flex gap-2">
            <button
              v-for="opt in ageOptions"
              :key="opt.value"
              type="button"
              @click="ageGroup = opt.value"
              :class="[
                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                ageGroup === opt.value
                  ? 'bg-primary-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="form-label">交易方式</label>
          <div class="flex gap-2">
            <button
              type="button"
              @click="isFree = true"
              :class="[
                'flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2',
                isFree
                  ? 'bg-green-50 text-green-600 border-green-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              ]"
            >
              🎁 免费送
            </button>
            <button
              type="button"
              @click="isFree = false"
              :class="[
                'flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2',
                !isFree
                  ? 'bg-primary-50 text-primary-600 border-primary-300'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              ]"
            >
              💰 付费转让
            </button>
          </div>
        </div>

        <div v-if="!isFree">
          <label class="form-label">价格（元）</label>
          <input
            v-model.number="price"
            type="number"
            min="0"
            step="1"
            placeholder="请输入转让价格"
            class="input-field"
          />
        </div>

        <div>
          <label class="form-label">图片链接</label>
          <div class="flex gap-2">
            <input
              v-model="imageUrl"
              type="text"
              placeholder="粘贴图片URL，按添加按钮加入"
              class="input-field flex-1"
              @keydown.enter.prevent="addImage"
            />
            <button
              type="button"
              @click="addImage"
              class="btn-outline !px-4"
            >
              <Upload class="w-5 h-5" />
            </button>
          </div>
          <div v-if="images.length > 0" class="grid grid-cols-4 gap-2 mt-3">
            <div
              v-for="(img, idx) in images"
              :key="idx"
              class="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group"
            >
              <img :src="img" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeImage(idx)"
                class="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                移除
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="form-label">绘本描述 <span class="text-red-400">*</span></label>
          <textarea
            v-model="description"
            rows="4"
            placeholder="介绍一下绘本的内容、使用情况等..."
            class="input-field resize-none"
          ></textarea>
        </div>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </p>

        <button
          @click="handleSubmit"
          :disabled="loading"
          class="btn-primary w-full !py-3 text-base"
        >
          {{ loading ? '发布中...' : '发布绘本' }}
        </button>
      </div>
    </div>
  </div>
</template>
