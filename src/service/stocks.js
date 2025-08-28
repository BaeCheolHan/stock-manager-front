₩import api, { swr } from './apiClient'

export const StocksService = {
  getDashboardIndexChart: (type) => swr(`index:${type}`, () => api.get(`/api/dashboard/index-chart/${type}`)),
  getKrVolumeRank: () => api.get('/api/dashboard/kr/volume/0000'),
  getStockDetail: (memberId, national, code, symbol) => swr(`detail:${memberId}:${national}:${code}:${symbol}`, () => api.get(`/api/stock/${memberId}/${national}/${code}?symbol=${symbol}`)),
  getStockChart: (type, national, symbol) => swr(`chart:${type}:${national}:${symbol}`, () => api.get(`/api/stock/chart/${type}/${national}/${symbol}`)),
  getStockBySymbol: (symbol) => swr(`symbol:${symbol}`, () => api.get(`/api/stock?symbol=${symbol}`)),
  getMemberStocks: (memberId) => swr(`mystocks:${memberId}`, () => api.get(`/api/stock/${memberId}`)),
  getMemberStocksByAccount: (memberId, accountId) => swr(`mystocks:${memberId}:${accountId}`, () => api.get(`/api/stock/${memberId}/${accountId}`)),
  saveStock: (payload) => api.post('/api/stock', payload),
  removeStockHistory: (id) => api.delete(`/api/stock/${id}`),
  getStocksByCode: (code) => swr(`stocks:${code}`, () => api.get(`/api/stocks/${code}`)),
  getCodesByNational: (national) => swr(`codes:${national}`, () => api.get(`/api/stocks/code/${national}`)),
}

export default StocksService

