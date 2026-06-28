import { ref, computed, watch } from 'vue'
import type { User } from '../../shared/index.js'

export type CurrentUser = Omit<User, 'password'>

const STORAGE_KEY = 'picture_book_user'

function loadFromStorage(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const currentUser = ref<CurrentUser | null>(loadFromStorage())

watch(currentUser, (val) => {
  if (val) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}, { deep: true })

export function useAuth() {
  const isLoggedIn = computed(() => !!currentUser.value)

  function setUser(user: CurrentUser | null) {
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  return {
    currentUser,
    isLoggedIn,
    setUser,
    logout,
  }
}
