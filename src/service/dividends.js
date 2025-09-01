import api from './apiClient'

export const DividendsService = {
  getMemberDividends: (memberId) => api.get(`/api/dividend/member/${memberId}`),
  getDividendsByItem: (memberId) => api.get(`/api/dividend/by-item/${memberId}`),
  getDividendsBySymbol: (memberId, symbol) => api.get(`/api/dividend/by-item/${memberId}/${symbol}`),
  getMonthlyChart: (memberId) => api.get(`/api/dividend/${memberId}/chart`),
  saveDividend: (payload) => api.post('/api/dividend', payload),
  removeDividend: (id) => api.delete(`/api/dividend/${id}`),
}

export default DividendsService

