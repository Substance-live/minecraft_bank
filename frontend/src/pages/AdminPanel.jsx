import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { publicAPI, adminAPI } from '../services/api'
import { 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  Edit, 
  DollarSign, 
  Package,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const AdminPanel = () => {
  const { isAuthenticated } = useAuth()
  const [resources, setResources] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [baseRates, setBaseRates] = useState({
    "Незеритовый слиток": 0.5,
    "Лазурит": 128,
    "Редстоун": 128,
    "Золотой слиток": 8,
    "Жемчуг эндера": 2,
    "Алмаз": 1
  })
  const [bankBalance, setBankBalance] = useState(0)

  // Состояния для форм
  const [transactionForm, setTransactionForm] = useState({
    player: '',
    resource: '',
    amount: ''
  })
  const [resourceForm, setResourceForm] = useState({
    name: '',
    amount: '',
    base_rate: ''
  })
  const [balanceForm, setBalanceForm] = useState({
    player: '',
    new_balance: ''
  })
  const [bankBalanceForm, setBankBalanceForm] = useState({
    new_balance: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resourcesRes, clientsRes, baseRatesRes, bankBalanceRes] = await Promise.all([
        publicAPI.getResourcePrices(),
        publicAPI.getClientBalances(),
        adminAPI.getBaseRates(),
        adminAPI.getBankBalance()
      ])
      setResources(resourcesRes.data.resources)
      setClients(clientsRes.data.clients)
      setBaseRates(baseRatesRes.data.base_rates)
      setBankBalance(bankBalanceRes.data.balance)
    } catch (err) {
      showMessage('error', 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleTransaction = async (type) => {
    try {
      const data = {
        player: transactionForm.player,
        resource: transactionForm.resource,
        amount: parseInt(transactionForm.amount)
      }

      const response = type === 'deposit' 
        ? await adminAPI.deposit(data)
        : await adminAPI.withdraw(data)

      showMessage('success', `${type === 'deposit' ? 'Депозит' : 'Снятие'} выполнено успешно!`)
      setTransactionForm({ player: '', resource: '', amount: '' })
      fetchData()
    } catch (err) {
      console.error('Transaction error:', err)
      showMessage('error', err.response?.data?.detail || 'Ошибка операции')
    }
  }

  const handleResourceOperation = async (operation) => {
    try {
      let response
      switch (operation) {
        case 'add':
          if (!resourceForm.name || !resourceForm.amount || !resourceForm.base_rate) {
            showMessage('error', 'Заполните все поля')
            return
          }
          if (parseFloat(resourceForm.base_rate) <= 0) {
            showMessage('error', 'Базовый курс должен быть больше 0')
            return
          }
          response = await adminAPI.addResource({
            name: resourceForm.name,
            amount: parseInt(resourceForm.amount),
            base_rate: parseFloat(resourceForm.base_rate)
          })
          showMessage('success', 'Ресурс добавлен успешно!')
          break
        case 'update':
          if (!resourceForm.name || !resourceForm.amount) {
            showMessage('error', 'Заполните название и количество')
            return
          }
          response = await adminAPI.updateResourceAmount({
            resource: resourceForm.name,
            new_amount: parseInt(resourceForm.amount)
          })
          showMessage('success', 'Количество ресурса обновлено!')
          break
        case 'delete':
          if (!resourceForm.name) {
            showMessage('error', 'Введите название ресурса')
            return
          }
          response = await adminAPI.deleteResource({
            resource: resourceForm.name
          })
          showMessage('success', 'Ресурс удален успешно!')
          break
        case 'update_rate':
          if (!resourceForm.name || !resourceForm.base_rate) {
            showMessage('error', 'Заполните название и курс')
            return
          }
          if (parseFloat(resourceForm.base_rate) <= 0) {
            showMessage('error', 'Базовый курс должен быть больше 0')
            return
          }
          response = await adminAPI.updateBaseRate({
            resource: resourceForm.name,
            new_rate: parseFloat(resourceForm.base_rate)
          })
          // Обновляем отображение курсов
          setBaseRates(prev => ({
            ...prev,
            [resourceForm.name]: parseFloat(resourceForm.base_rate)
          }))
          showMessage('success', 'Курс обновлен успешно!')
          break
      }
      setResourceForm({ name: '', amount: '', base_rate: '' })
      fetchData()
    } catch (err) {
      console.error('Resource operation error:', err)
      showMessage('error', err.response?.data?.detail || 'Ошибка операции')
    }
  }

  const handleBalanceUpdate = async () => {
    try {
      await adminAPI.updateBalance({
        player: balanceForm.player,
        new_balance: parseFloat(balanceForm.new_balance)
      })
      showMessage('success', 'Баланс обновлен успешно!')
      setBalanceForm({ player: '', new_balance: '' })
      fetchData()
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Ошибка обновления баланса')
    }
  }

  const handleBankBalanceUpdate = async () => {
    try {
      await adminAPI.updateBankBalance({
        new_balance: parseFloat(bankBalanceForm.new_balance)
      })
      showMessage('success', 'Баланс банка обновлен успешно!')
      setBankBalanceForm({ new_balance: '' })
      fetchData()
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Ошибка обновления баланса банка')
    }
  }



  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-minecraft-green" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Settings size={32} className="text-minecraft-green" />
          <h1 className="text-3xl font-bold text-white minecraft-text">
            Админ панель
          </h1>
        </div>
        <p className="text-gray-400">
          Управление ресурсами, клиентами и транзакциями
        </p>
      </div>

      {/* Сообщения */}
      {message.text && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900 border border-green-700' 
            : 'bg-red-900 border border-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-400" />
          ) : (
            <AlertCircle size={20} className="text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Баланс банка */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign size={24} className="text-minecraft-green" />
          <h2 className="text-xl font-bold text-white">Баланс банка</h2>
        </div>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-minecraft-green">
            ${bankBalance.toLocaleString()}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Общий капитал банка для проведения операций
          </p>
        </div>
        
        {/* Форма изменения баланса банка */}
        <div className="border-t border-gray-600 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Изменить баланс банка</h3>
          <div className="flex space-x-4">
            <input
              type="number"
              step="0.01"
              placeholder="Новый баланс банка"
              value={bankBalanceForm.new_balance}
              onChange={(e) => setBankBalanceForm({...bankBalanceForm, new_balance: e.target.value})}
              className="input-field flex-1"
            />
            <button
              onClick={handleBankBalanceUpdate}
              className="admin-button px-6 py-2 rounded text-white font-bold"
            >
              <Edit size={16} className="inline mr-2" />
              Обновить
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Изменение баланса банка повлияет на цены всех ресурсов
          </p>
        </div>
      </div>

      {/* Транзакции */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <DollarSign size={24} className="text-minecraft-green" />
          <h2 className="text-xl font-bold text-white">Транзакции</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Игрок"
            value={transactionForm.player}
            onChange={(e) => setTransactionForm({...transactionForm, player: e.target.value})}
            className="input-field"
          />
          <select
            value={transactionForm.resource}
            onChange={(e) => setTransactionForm({...transactionForm, resource: e.target.value})}
            className="input-field"
          >
            <option value="">Выберите ресурс</option>
            {resources.map(resource => (
              <option key={resource.name} value={resource.name}>{resource.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Количество"
            value={transactionForm.amount}
            onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
            className="input-field"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleTransaction('deposit')}
            className="admin-button px-6 py-2 rounded text-white font-bold"
          >
            <Plus size={16} className="inline mr-2" />
            Депозит
          </button>
          <button
            onClick={() => handleTransaction('withdraw')}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition-colors"
          >
            <Minus size={16} className="inline mr-2" />
            Снятие
          </button>
        </div>
      </div>

      {/* Управление ресурсами */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Package size={24} className="text-minecraft-green" />
          <h2 className="text-xl font-bold text-white">Управление ресурсами</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Название ресурса"
            value={resourceForm.name}
            onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Количество"
            value={resourceForm.amount}
            onChange={(e) => setResourceForm({...resourceForm, amount: e.target.value})}
            className="input-field"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Базовый курс (1 алмаз = N ресурса)"
            value={resourceForm.base_rate}
            onChange={(e) => setResourceForm({...resourceForm, base_rate: e.target.value})}
            className="input-field"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleResourceOperation('add')}
            className="admin-button px-6 py-2 rounded text-white font-bold"
          >
            <Plus size={16} className="inline mr-2" />
            Добавить
          </button>
          <button
            onClick={() => handleResourceOperation('update')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-bold transition-colors"
          >
            <Edit size={16} className="inline mr-2" />
            Обновить количество
          </button>
          <button
            onClick={() => handleResourceOperation('update_rate')}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded text-white font-bold transition-colors"
          >
            <DollarSign size={16} className="inline mr-2" />
            Обновить курс
          </button>
          <button
            onClick={() => handleResourceOperation('delete')}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-bold transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            Удалить
          </button>
        </div>

        {/* Текущие курсы ресурсов */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Текущие базовые курсы (1 алмаз = N ресурса)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(baseRates).map(([resource, rate]) => (
              <div key={resource} className="text-center p-2 bg-gray-600 rounded">
                <div className="text-sm text-gray-300">{resource}</div>
                <div className="text-minecraft-green font-bold">{rate}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * Для обновления курса заполните название ресурса и новый курс, затем нажмите "Обновить курс"
          </p>
        </div>
      </div>

      {/* Управление балансами */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Users size={24} className="text-minecraft-green" />
          <h2 className="text-xl font-bold text-white">Управление балансами</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={balanceForm.player}
            onChange={(e) => setBalanceForm({...balanceForm, player: e.target.value})}
            className="input-field"
          >
            <option value="">Выберите игрока</option>
            {clients.map(client => (
              <option key={client.name} value={client.name}>{client.name}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Новый баланс"
            value={balanceForm.new_balance}
            onChange={(e) => setBalanceForm({...balanceForm, new_balance: e.target.value})}
            className="input-field"
          />
        </div>
        
        <button
          onClick={handleBalanceUpdate}
          className="admin-button px-6 py-2 rounded text-white font-bold"
        >
          <Edit size={16} className="inline mr-2" />
          Обновить баланс
        </button>
      </div>



      {/* Кнопка обновления данных */}
      <div className="text-center">
        <button
          onClick={fetchData}
          className="btn-secondary"
        >
          <RefreshCw size={20} className="inline mr-2" />
          Обновить данные
        </button>
      </div>
    </div>
  )
}

export default AdminPanel 