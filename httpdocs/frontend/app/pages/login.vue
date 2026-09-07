<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <main class="mx-auto min-h-screen max-w-md p-8">
    <div class="space-y-5 rounded-xl border border-slate-200 p-6 shadow-sm">
      <h1 class="text-2xl font-semibold">Вход</h1>
      <p class="text-slate-600">Каталог и гостевые функции доступны без авторизации.</p>
      <button class="w-full rounded-lg bg-slate-900 px-4 py-2 text-white" @click="auth.startLogin">
        Войти через Laravel
      </button>
      <NuxtLink class="block text-center text-sm text-slate-600" to="/">Продолжить как гость</NuxtLink>
    </div>
  </main>
</template>
