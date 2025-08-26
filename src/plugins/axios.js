import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  timeout: 15000,
  withCredentials: false,
})

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const userInfoRaw = sessionStorage.getItem('userInfo')
      if (userInfoRaw) {
        const userInfo = JSON.parse(userInfoRaw)
        if (userInfo && userInfo.token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${userInfo.token}`
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // 인증 만료 처리: 세션 초기화 및 로그인 화면 이동
      try {
        const router = (await import('@/router')).default
        sessionStorage.removeItem('userInfo')
        router.replace('/settings')
      } catch (_) {}
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

