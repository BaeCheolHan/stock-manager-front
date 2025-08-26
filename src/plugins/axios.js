import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '',
  timeout: 15000,
  withCredentials: false,
})

axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: 전역 에러 처리(UI 토스트 등) 연결 가능
    return Promise.reject(error)
  }
)

export default axiosInstance

