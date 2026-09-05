import type { User } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)

  async function fetchUser(): Promise<User | null> {
    if (!accessToken.value) {
      return null
    }

    user.value = await useApi()('/api/user')

    return user.value
  }

  function setAccessToken(token: string): void {
    accessToken.value = token
  }

  function clear(): void {
    user.value = null
    accessToken.value = null
  }

  return {
    user,
    accessToken,
    fetchUser,
    setAccessToken,
    clear,
  }
}, {
  persist: {
    pick: ['user'],
  },
})
