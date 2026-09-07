import type { User } from '~/types/auth'
import { sha256 } from '@noble/hashes/sha2.js'

interface OAuthTokenResponse {
  token_type: 'Bearer'
  access_token: string
  refresh_token: string
  expires_in: number
}

const PKCE_STORAGE_KEY = 'nuxt.oauth.pkce'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  async function startLogin(): Promise<void> {
    const verifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)))
    const state = toBase64Url(crypto.getRandomValues(new Uint8Array(32)))
    const challenge = toBase64Url(sha256(new TextEncoder().encode(verifier)))

    sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify({ verifier, state }))

    const params = new URLSearchParams({
      client_id: config.public.oauthClientId,
      redirect_uri: config.public.oauthRedirectUri,
      response_type: 'code',
      scope: '',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })

    window.location.assign(`${config.public.apiBase}/oauth/authorize?${params}`)
  }

  async function completeLogin(code: string, state: string): Promise<User> {
    const saved = JSON.parse(sessionStorage.getItem(PKCE_STORAGE_KEY) || 'null') as { verifier: string; state: string } | null

    if (!saved || saved.state !== state) throw new Error('Некорректное состояние OAuth-запроса.')

    const response = await $fetch<OAuthTokenResponse>(`${config.public.apiBase}/oauth/token`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: { grant_type: 'authorization_code', client_id: config.public.oauthClientId, redirect_uri: config.public.oauthRedirectUri, code, code_verifier: saved.verifier },
    })

    sessionStorage.removeItem(PKCE_STORAGE_KEY)
    accessToken.value = response.access_token
    refreshToken.value = response.refresh_token
    user.value = await useApi()('/api/auth/me')
    return user.value as User
  }

  async function refresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      const response = await $fetch<OAuthTokenResponse>(`${config.public.apiBase}/oauth/token`, {
        method: 'POST', headers: { Accept: 'application/json' },
        body: { grant_type: 'refresh_token', client_id: config.public.oauthClientId, refresh_token: refreshToken.value },
      })
      accessToken.value = response.access_token
      refreshToken.value = response.refresh_token
      return true
    } catch {
      clear()
      return false
    }
  }

  async function fetchUser(): Promise<User | null> {
    if (!accessToken.value) return null
    user.value = await useApi()('/api/auth/me')
    return user.value
  }

  async function logout(): Promise<void> {
    if (accessToken.value) await useApi()('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    clear()
  }

  function clear(): void {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
  }

  return { user, accessToken, refreshToken, startLogin, completeLogin, refresh, fetchUser, logout, clear }
})

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}