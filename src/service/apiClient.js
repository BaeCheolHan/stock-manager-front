import axios from '@/plugins/axios'

export const apiClient = {
  get: (url, config) => axios.get(url, config),
  post: (url, data, config) => axios.post(url, data, config),
  put: (url, data, config) => axios.put(url, data, config),
  delete: (url, config) => axios.delete(url, config),
}

export default apiClient

export const PublicService = {
  getExchangeRate: () => apiClient.get('/api/exchange-rate'),
  getSnsLoginUrl: (snsType) => apiClient.get(`/login/${snsType}`)
}

// Simple SWR helper
export async function swr(key, fetcher, cache = swr.cache) {
  if (cache.has(key)) {
    const cached = cache.get(key)
    // Fire and forget background revalidation
    fetcher().then(res => cache.set(key, res)).catch(() => {})
    return cached
  }
  const res = await fetcher()
  cache.set(key, res)
  return res
}
swr.cache = new Map()
