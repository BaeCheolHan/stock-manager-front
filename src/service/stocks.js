import api from './apiClient'

export const StocksService = {
  getDashboardIndexChart: (type) => api.get(`/api/dashboard/index-chart/${type}`),
  getKrVolumeRank: () => api.get('/api/dashboard/kr/volume/0000'),
  getStockDetail: (memberId, national, code, symbol) => api.get(`/api/stock/${memberId}/${national}/${code}?symbol=${symbol}`),
  getStockChart: (type, national, symbol) => api.get(`/api/stock/chart/${type}/${national}/${symbol}`),
  getMemberStocks: (memberId) => api.get(`/api/stock/${memberId}`),
  getMemberStocksByAccount: (memberId, accountId) => api.get(`/api/stock/${memberId}/${accountId}`),
  saveStock: (payload) => api.post('/api/stock', payload),
  removeStockHistory: (id) => api.delete(`/api/stock/${id}`),
  getStocksByCode: (code) => api.get(`/api/stocks/${code}`),
  getCodesByNational: (national) => api.get(`/api/stocks/code/${national}`),
}

export default StocksService

