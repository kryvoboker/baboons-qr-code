<script setup lang="ts">useHead({ title: 'Reset password' }); const email=ref(''); const sent=ref(false); const submit=async()=>{await $fetch('/api/auth/forgot-password',{method:'POST',body:{email:email.value}});sent.value=true;};</script>
<template>
    <section>
        <div class="container">
            <div class="mx-auto max-w-md px-4 py-16">
                <div class="card border-base-content/10 border">
                    <form class="card-body" @submit.prevent="submit">
                        <span class="icon-[tabler--lock-question] text-primary size-8" />
                        <h1 class="card-title text-2xl">Forgot password?</h1>
                        <p class="text-base-content/60 text-sm">Enter your email. If an account exists, we will send a reset link.</p>
                        <div v-if="sent" class="alert alert-success alert-soft">Check your inbox for the reset link.</div>
                        <label class="form-control">
                            <span class="label-text mb-1">Email</span>
                            <input v-model="email" type="email" class="input" required />
                        </label>
                        <button class="btn btn-primary">Send reset link</button>
                        <NuxtLink class="btn btn-text" to="/auth/login">Back to login</NuxtLink>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>
