<script setup lang="ts">
import { ref } from 'vue'
import type { AgeGroup, Book, ApiResponse } from '../../shared/index.js'
import { Upload, X, ImagePlus } from 'lucide-vue-next'

const emit = defineEmits<{
  submit: [book: Book]
}>()

const props = defineProps<{
  sellerId: string
}>()

const title = ref('')
const author = ref('')
const category = ref('启蒙认知')
const ageGroup = ref<AgeGroup>('0-3')
const isFree = ref(true)
const price = ref<number>(0)
const condition = ref('九成新')
const description = ref('')
const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const loading = ref(false)
const errorMsg = ref('')

const categories = ['启蒙认知', '情感成长', '习惯养成', '科普百科', '文学故事', '艺术创意', '其他']
const ageOptions: { value: AgeGroup; label: string }[] = [
  { value: '0-3', label: '0-3岁' },
  { value: '3-6', label: '3-6岁' },
  { value: '6+', label: '6岁以上' },
]
const conditions = ['全新', '九成新', '八成新', '七成新', '有磨损']

function handleCoverChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const allowed = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowed.includes(file.type)) {
    errorMsg.value = '只支持 JPG/JPEG/PNG 格式'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = '图片不能超过 2MB'
    return
  }
  errorMsg.value = ''
  coverFile.value = file

  const reader = new FileReader()
  reader.onload = (ev) => {
    coverPreview.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeCover() {
  coverFile.value = null
  coverPreview.value = ''
  const input = document.getElementById('cover-input') as HTMLInputElement | null
  if (input) input.value = ''
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
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('author', author.value)
    formData.append('category', category.value)
    formData.append('ageGroup', ageGroup.value)
    formData.append('isFree', String(isFree.value))
    formData.append('price', String(isFree.value ? 0 : price.value))
    formData.append('condition', condition.value)
    formData.append('description', description.value)
    formData.append('sellerId', props.sellerId)
    if (coverFile.value) {
      formData.append('cover', coverFile.value)
    }

    const res = await fetch('/api/books', {
      method: 'POST',
      body: formData,
    })
    const result = (await res.json()) as ApiResponse<Book>

    if (result.success && result.data) {
      emit('submit', result.data)
    } else {
      errorMsg.value = result.message || '发布失败'
    }
  } catch (err) {
    errorMsg.value = (err as Error)?.message || '上传失败，请检查图片格式和大小'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <label class="form-label">封面图 <span class="text-xs text-gray-400 ml-1">支持 JPG/PNG，≤ 2MB</span></label>
      <div
        v-if="!coverPreview"
        class="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
      >
        <input
          id="cover-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          class="hidden"
          @change="handleCoverChange"
        />
        <label for="cover-input" class="cursor-pointer flex flex-col items-center gap-2">
          <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
            <ImagePlus class="w-7 h-7 text-gray-400" />
          </div>
          <p class="text-sm text-gray-600 font-medium">点击选择封面图片</p>
          <p class="text-xs text-gray-400">有图才有点击量，建议上传真实封面~</p>
        </label>
      </div>
      <div v-else class="relative rounded-2xl overflow-hidden border border-gray-200">
        <img :src="coverPreview" alt="封面预览" class="w-full max-h-80 object-contain bg-gray-50" />
        <button
          type="button"
          @click="removeCover"
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

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
      <label class="form-label">绘本描述 <span class="text-red-400">*</span></label>
      <textarea
        v-model="description"
        rows="4"
        placeholder="介绍一下绘本的内容、使用情况、自提方式等..."
        class="input-field resize-none"
      ></textarea>
    </div>

    <p v-if="errorMsg" class="text-red-500 text-sm text-center">
      {{ errorMsg }}
    </p>

    <button
      @click="handleSubmit"
      :disabled="loading"
      class="btn-primary w-full !py-3 text-base flex items-center justify-center gap-2"
    >
      <Upload v-if="!loading" class="w-5 h-5" />
      {{ loading ? '发布中...' : '发布绘本' }}
    </button>
  </div>
</template>
