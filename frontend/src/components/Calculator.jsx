import { useState, useEffect } from 'react'
import { publicAPI } from '../services/api'
import { Calculator as CalculatorIcon, DollarSign, Package, AlertCircle, CheckCircle } from 'lucide-react'

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('deposit')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [resources, setResources] = useState([])

  // Формы для калькуляторов
  const [depositForm, setDepositForm] = useState({
    resource: '',
    amount: '',
    money: ''
  })

  const [withdrawForm, setWithdrawForm] = useState({
    resource: '',
    amount: '',
    money: ''
  })

  // Загрузка списка ресурсов
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await publicAPI.getResourcePrices()
        setResources(response.data.resources)
      } catch (err) {
        console.error('Error fetching resources:', err)
      }
    }
    fetchResources()
  }, [])

  const handleDepositCalculation = async (type) => {
    if (!depositForm.resource) {
      setError('Выберите ресурс')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      if (type === 'earned') {
        if (!depositForm.amount || depositForm.amount <= 0) {
          setError('Введите количество ресурсов')
          return
        }
        response = await publicAPI.calcDepositEarned({
          resource: depositForm.resource,
          add_amount: parseInt(depositForm.amount)
        })
        setResult({
          type: 'earned',
          value: response.data.earned,
          resource: depositForm.resource,
          amount: depositForm.amount
        })
      } else {
        if (!depositForm.money || depositForm.money <= 0) {
          setError('Введите сумму денег')
          return
        }
        response = await publicAPI.calcDepositAmountForMoney({
          resource: depositForm.resource,
          target_money: parseFloat(depositForm.money)
        })
        setResult({
          type: 'amount',
          value: response.data.needed_amount,
          resource: depositForm.resource,
          money: depositForm.money
        })
      }
    } catch (err) {
      console.error('Deposit calculation error:', err)
      setError(err.response?.data?.detail || 'Ошибка расчета')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawCalculation = async (type) => {
    if (!withdrawForm.resource) {
      setError('Выберите ресурс')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      if (type === 'cost') {
        if (!withdrawForm.amount || withdrawForm.amount <= 0) {
          setError('Введите количество ресурсов')
          return
        }
        response = await publicAPI.calcWithdrawCost({
          resource: withdrawForm.resource,
          withdraw_amount: parseInt(withdrawForm.amount)
        })
        setResult({
          type: 'cost',
          value: response.data.cost,
          resource: withdrawForm.resource,
          amount: withdrawForm.amount
        })
      } else {
        if (!withdrawForm.money || withdrawForm.money <= 0) {
          setError('Введите сумму денег')
          return
        }
        response = await publicAPI.calcWithdrawAmountForMoney({
          resource: withdrawForm.resource,
          available_money: parseFloat(withdrawForm.money)
        })
        setResult({
          type: 'amount',
          value: response.data.max_amount,
          resource: withdrawForm.resource,
          money: withdrawForm.money
        })
      }
    } catch (err) {
      console.error('Withdraw calculation error:', err)
      setError(err.response?.data?.detail || 'Ошибка расчета')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setError('')
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <CalculatorIcon size={24} className="text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Калькуляторы</h2>
      </div>

      {/* Сообщения об ошибках и результатах */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-900 border border-red-700 rounded-lg mb-4">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center space-x-2 p-3 bg-green-900 border border-green-700 rounded-lg mb-4">
          <CheckCircle size={20} className="text-green-400" />
          <div className="text-green-400">
            <div>
              {result.type === 'earned' && (
                <>За {result.amount} {result.resource} вы получите ${result.value.toFixed(2)}</>
              )}
              {result.type === 'amount' && activeTab === 'deposit' && (
                <>Для получения ${result.money} нужно сдать {result.value} {result.resource}</>
              )}
              {result.type === 'amount' && activeTab === 'withdraw' && (
                <>За ${result.money} можно купить {result.value} {result.resource}</>
              )}
              {result.type === 'cost' && (
                <>За {result.amount} {result.resource} нужно заплатить ${result.value.toFixed(2)}</>
              )}
            </div>
            {activeTab === 'deposit' && (
              <div className="text-yellow-300 text-sm mt-1">
                ⚠️ Комиссия 5% уже учтена в расчете
              </div>
            )}
            {activeTab === 'withdraw' && (
              <div className="text-green-300 text-sm mt-1">
                ✅ Без комиссии • Поэтапная цена (большие объемы дороже)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Табы */}
      <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => {
            setActiveTab('deposit')
            clearResults()
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deposit'
              ? 'bg-minecraft-green text-black'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Депозит
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw')
            clearResults()
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'withdraw'
              ? 'bg-minecraft-green text-black'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Снятие
        </button>
      </div>

      {/* Калькулятор депозита */}
      {activeTab === 'deposit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={depositForm.resource}
              onChange={(e) => setDepositForm({...depositForm, resource: e.target.value})}
              className="input-field"
            >
              <option value="">Выберите ресурс</option>
              {resources.map(resource => (
                <option key={resource.name} value={resource.name}>
                  {resource.name} (${resource.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Количество ресурсов"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Сумма денег"
              value={depositForm.money}
              onChange={(e) => setDepositForm({...depositForm, money: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleDepositCalculation('earned')}
              disabled={loading}
              className="admin-button px-6 py-3 rounded text-white font-bold disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Расчет...</span>
                </div>
              ) : (
                <>
                  <DollarSign size={16} className="inline mr-2" />
                  Сколько денег за ресурсы
                </>
              )}
            </button>

            <button
              onClick={() => handleDepositCalculation('amount')}
              disabled={loading}
              className="admin-button px-6 py-3 rounded text-white font-bold disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Расчет...</span>
                </div>
              ) : (
                <>
                  <Package size={16} className="inline mr-2" />
                  Сколько ресурсов за деньги
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Калькулятор снятия */}
      {activeTab === 'withdraw' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={withdrawForm.resource}
              onChange={(e) => setWithdrawForm({...withdrawForm, resource: e.target.value})}
              className="input-field"
            >
              <option value="">Выберите ресурс</option>
              {resources.map(resource => (
                <option key={resource.name} value={resource.name}>
                  {resource.name} (${resource.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Количество ресурсов"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Сумма денег"
              value={withdrawForm.money}
              onChange={(e) => setWithdrawForm({...withdrawForm, money: e.target.value})}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleWithdrawCalculation('cost')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-bold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Расчет...</span>
                </div>
              ) : (
                <>
                  <DollarSign size={16} className="inline mr-2" />
                  Сколько стоит получить ресурсы
                </>
              )}
            </button>

            <button
              onClick={() => handleWithdrawCalculation('amount')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-bold transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Расчет...</span>
                </div>
              ) : (
                <>
                  <Package size={16} className="inline mr-2" />
                  Сколько ресурсов за деньги
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator 