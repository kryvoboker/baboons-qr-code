<template>
    <footer class="border-base-content/10 border-t">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
            <div class="md:col-span-2">
                <div class="flex items-center gap-2 font-semibold"><ResponsiveImage src="/images/brand/logo-mark.svg" alt="" class="size-8" />Baboons QR-code</div>
                <p class="text-base-content/60 mt-3 max-w-md text-sm">Simple static QR codes for free. Editable, trackable dynamic QR codes when you need control.</p>
            </div>
            <div><h3 class="font-medium">Product</h3><div class="mt-3 grid gap-2 text-sm"><NuxtLink to="/pricing">Pricing</NuxtLink><NuxtLink to="/templates">Templates</NuxtLink></div></div>
            <div><h3 class="font-medium">Account</h3><div class="mt-3 grid gap-2 text-sm"><NuxtLink to="/auth/login">Log in</NuxtLink><NuxtLink to="/auth/register">Create account</NuxtLink></div></div>
        </div>
    </footer>
</template>
