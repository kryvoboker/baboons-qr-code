export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  return $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      Accept: 'application/json',
    },
    onRequest({ options }) {
      if (auth.accessToken) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${auth.accessToken}`)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        auth.clear()
      }
    },
  })
}