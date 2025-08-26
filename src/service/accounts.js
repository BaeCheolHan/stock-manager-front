import api from './apiClient'

export const AccountsService = {
  getBanks: () => api.get('/api/banks'),
  getMemberAccounts: (memberId) => api.get(`/api/bank/member/${memberId}`),
  saveAccount: (payload) => api.post('/api/account', payload),
  removeAccount: (id) => api.delete(`/api/bank/${id}`),
  setDefaultAccount: (memberId, id) => api.put(`/api/default-bank/${memberId}/${id}`),
  getPersonalSetting: (accountId) => api.get(`/api/personal-setting/${accountId}`),
  savePersonalSetting: (accountId, payload) => api.put(`/api/personal-setting/${accountId}`, payload),
}

export default AccountsService

