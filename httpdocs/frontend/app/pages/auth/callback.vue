<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  const code = String(route.query.code || '')
  const state = String(route.query.state || '')
  const oauthError = String(route.query.error || '')

  if (oauthError) {
    error.value = `Авторизация отменена: ${oauthError}`
    return
  }
  if (!code || !state) {
    error.value = 'OAuth callback не содержит обязательных параметров.'
    return
  }

  try {
    await auth.completeLogin(code, state)
    await navigateTo('/')
  } catch (cause: unknown) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось завершить авторизацию.'
  }
})
</script>

<template>
  <main class="mx-auto min-h-screen max-w-md p-8">
    <p v-if="!error">Завершаем вход…</p>
    <div v-else class="space-y-4 rounded-xl border border-red-200 p-6">
      <p class="text-red-700">{{ error }}</p>
      <NuxtLink class="text-slate-700 underline" to="/login">Вернуться ко входу</NuxtLink>
    </div>
  </main>
</template>
