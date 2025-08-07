import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers['X-Auth-Token'] = token
  }
  return config
})

// Интерцептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем токен при ошибке авторизации
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Публичные API
export const publicAPI = {
  // Получить цены ресурсов
  getResourcePrices: () => api.get('/resources/prices'),
  
  // Получить балансы клиентов
  getClientBalances: () => api.get('/clients/balances'),
  
  // Получить вклады клиента
  getClientDeposits: (clientName) => api.get(`/clients/${clientName}/deposits`),
  
  // Получить кредиты клиента
  getClientCredits: (clientName) => api.get(`/clients/${clientName}/credits`),
  
  // Регистрация карты
  registerCard: (data) => api.post('/clients/register', data),
  
  // Публичные калькуляторы
  calcDepositEarned: (data) => api.post('/resources/public/deposit/earned', data),
  calcDepositAmountForMoney: (data) => api.post('/resources/public/deposit/amount-for-money', data),
  calcWithdrawCost: (data) => api.post('/resources/public/withdraw/cost', data),
  calcWithdrawAmountForMoney: (data) => api.post('/resources/public/withdraw/amount-for-money', data),
  
  // История цен ресурса
  getResourceHistory: (resource, limit = 20) => api.get(`/resources/${resource}/history?limit=${limit}`),
}

// Административные API
export const adminAPI = {
  // Аутентификация
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Транзакции
  deposit: (data) => api.post('/admin/deposit', data),
  withdraw: (data) => api.post('/admin/withdraw', data),
  
  // Управление ресурсами
  updateResourceAmount: (data) => api.post('/admin/update-resource-amount', data),
  addResource: (data) => api.post('/admin/add-resource', data),
  deleteResource: (data) => api.delete('/admin/delete-resource', { data }),
  updateBaseRate: (data) => api.post('/admin/update-base-rate', data),
  getBaseRates: () => api.get('/admin/base-rates'),
  
  // Управление клиентами
  updateBalance: (data) => api.post('/admin/update-balance', data),
  addClient: (data) => api.post('/admin/add-client', data),
  deleteClient: (data) => api.delete('/admin/delete-client', { data }),
  
  // Банковский счет
  getBankBalance: () => api.get('/admin/bank-balance'),
  updateBankBalance: (data) => api.post('/admin/update-bank-balance', data),
  
  // Вклады
  createDeposit: (data) => api.post('/admin/create-deposit', data),
  getClientDeposits: (clientName) => api.get(`/admin/client-deposits/${clientName}`),
  processExpiredDeposits: () => api.post('/admin/process-expired-deposits'),
  earlyReturnDeposit: (depositId) => api.post(`/admin/early-return-deposit/${depositId}`),
  
  // Кредиты
  createCredit: (data) => api.post('/admin/create-credit', data),
  getClientCredits: (clientName) => api.get(`/admin/client-credits/${clientName}`),
  processOverdueCredits: () => api.post('/admin/process-overdue-credits'),
  earlyRepayCredit: (creditId) => api.post(`/admin/early-repay-credit/${creditId}`),
}

export default api 