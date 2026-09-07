<script setup lang="ts">
const auth = useAuthStore()

async function signOut(): Promise<void> {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <main class="mx-auto min-h-screen max-w-2xl p-8">
    <div v-if="auth.user" class="rounded-xl border border-slate-200 p-6 shadow-sm">
      <h1 class="text-2xl font-semibold">Nuxt подключён к Laravel API</h1>
      <p class="mt-3 text-slate-600">Вы вошли как {{ auth.user.name }} ({{ auth.user.email }})</p>
      <button class="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white" @click="signOut">
        Выйти
      </button>
    </div>

    <div v-else class="rounded-xl border border-slate-200 p-6 shadow-sm">
      <h1 class="text-2xl font-semibold">Добро пожаловать в магазин</h1>
      <p class="mt-3 text-slate-600">Вы можете продолжить как гость. Авторизация понадобится только для действий, связанных с аккаунтом.</p>
      <NuxtLink class="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white" to="/login">
        Войти в аккаунт
      </NuxtLink>
    </div>
  </main>
</template>
