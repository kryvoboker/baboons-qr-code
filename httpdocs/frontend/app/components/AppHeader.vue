<template>
    <header class="border-base-content/10 bg-base-100/95 sticky top-0 z-40 border-b backdrop-blur">
        <div class="navbar mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="navbar-start gap-3">
                <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
                    <ResponsiveImage src="/images/brand/logo-mark.svg" alt="Baboons QR-code" class="size-9" />
                    <span class="hidden sm:inline">Baboons QR-code</span>
                </NuxtLink>
            </div>
            <nav class="navbar-center hidden gap-1 lg:flex">
                <NuxtLink class="btn btn-text btn-sm" to="/#generator">Create QR</NuxtLink>
                <NuxtLink class="btn btn-text btn-sm" to="/pricing">Pricing</NuxtLink>
                <NuxtLink class="btn btn-text btn-sm" to="/#how-it-works">How it works</NuxtLink>
            </nav>
            <div class="navbar-end gap-1 sm:gap-2">
                <GlobalQrSearch class="hidden md:block" />
                <ThemeMenu />
                <NuxtLink class="btn btn-text btn-sm hidden sm:inline-flex" to="/auth/login">Log in</NuxtLink>
                <NuxtLink class="btn btn-primary btn-sm" to="/auth/register">Start free</NuxtLink>
            </div>
        </div>
        <div class="border-base-content/10 border-t px-4 py-2 md:hidden"><GlobalQrSearch mobile /></div>
    </header>
</template>
