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
      setError('Выберите актив')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      if (type === 'earned') {
        if (!depositForm.amount || depositForm.amount <= 0) {
          setError('Введите количество')
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
          setError('Введите сумму')
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
      setError('Выберите актив')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      if (type === 'cost') {
        if (!withdrawForm.amount || withdrawForm.amount <= 0) {
          setError('Введите количество')
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
          setError('Введите сумму')
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CalculatorIcon size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Торговый калькулятор</h2>
            <p className="text-text-secondary text-sm">Расчет операций с активами</p>
          </div>
        </div>
      </div>

      {/* Сообщения об ошибках и результатах */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-danger/10 border border-danger/20 rounded-lg mb-4">
          <AlertCircle size={20} className="text-danger" />
          <span className="text-danger font-medium">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center space-x-2 p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
          <CheckCircle size={20} className="text-success" />
            <div>
            <div className="text-success font-medium">
              {result.type === 'earned' && (
                <>За {result.amount} {result.resource} вы получите ₴{result.value.toFixed(2)}</>
              )}
              {result.type === 'amount' && activeTab === 'deposit' && (
                <>Для получения ₴{result.money} нужно внести {result.value} {result.resource}</>
              )}
              {result.type === 'amount' && activeTab === 'withdraw' && (
                <>За ₴{result.money} вы получите {result.value} {result.resource}</>
              )}
              {result.type === 'cost' && (
                <>За {result.amount} {result.resource} стоимость составит ₴{result.value.toFixed(2)}</>
              )}
            </div>
            {activeTab === 'deposit' && (
              <div className="text-warning text-sm mt-1 font-medium">
                Комиссия 5% включена в расчет
              </div>
            )}
            {activeTab === 'withdraw' && (
              <div className="text-success text-sm mt-1 font-medium">
                Без комиссии • Динамическое ценообразование
              </div>
            )}
          </div>
        </div>
      )}

      {/* Табы */}
      <div className="flex space-x-2 p-1 bg-background rounded-lg mb-6">
        <button
          onClick={() => {
            setActiveTab('deposit')
            clearResults()
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'deposit'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text hover:bg-surface'
          }`}
        >
          Покупка
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw')
            clearResults()
          }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'withdraw'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text hover:bg-surface'
          }`}
        >
          Продажа
        </button>
      </div>

      {/* Калькулятор покупки */}
      {activeTab === 'deposit' && (
        <div className="space-y-8">
          <div className="p-6 bg-background rounded-lg border border-border">
            <h3 className="text-text font-medium mb-4">Расчет прибыли</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={depositForm.resource}
              onChange={(e) => setDepositForm({...depositForm, resource: e.target.value})}
              className="input-field"
            >
                <option value="">Выберите актив</option>
              {resources.map(resource => (
                <option key={resource.name} value={resource.name}>
                  {resource.name} (${resource.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
                placeholder="Количество"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
              className="input-field"
            />
              <button
                onClick={() => handleDepositCalculation('earned')}
                className="btn-success"
                disabled={loading}
              >
                <DollarSign size={16} className="inline mr-2" />
                Рассчитать прибыль
              </button>
            </div>
          </div>

          <div className="p-6 bg-background rounded-lg border border-border">
            <h3 className="text-text font-medium mb-4">Расчет количества</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={depositForm.resource}
                onChange={(e) => setDepositForm({...depositForm, resource: e.target.value})}
                className="input-field"
              >
                <option value="">Выберите актив</option>
                {resources.map(resource => (
                  <option key={resource.name} value={resource.name}>
                    {resource.name} (${resource.price.toFixed(2)})
                  </option>
                ))}
              </select>
                          <input
                type="number"
                placeholder="Желаемая сумма ₴"
                value={depositForm.money}
                onChange={(e) => setDepositForm({...depositForm, money: e.target.value})}
                className="input-field"
              />
            <button
              onClick={() => handleDepositCalculation('amount')}
                className="btn-success"
              disabled={loading}
              >
                  <Package size={16} className="inline mr-2" />
                Рассчитать количество
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Калькулятор продажи */}
      {activeTab === 'withdraw' && (
        <div className="space-y-8">
          <div className="p-6 bg-background rounded-lg border border-border">
            <h3 className="text-text font-medium mb-4">Расчет стоимости</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={withdrawForm.resource}
              onChange={(e) => setWithdrawForm({...withdrawForm, resource: e.target.value})}
              className="input-field"
            >
                <option value="">Выберите актив</option>
              {resources.map(resource => (
                <option key={resource.name} value={resource.name}>
                  {resource.name} (${resource.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              type="number"
                placeholder="Количество"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
              className="input-field"
            />
              <button
                onClick={() => handleWithdrawCalculation('cost')}
                className="btn-primary"
                disabled={loading}
              >
                <DollarSign size={16} className="inline mr-2" />
                Рассчитать стоимость
              </button>
            </div>
          </div>

          <div className="p-6 bg-background rounded-lg border border-border">
            <h3 className="text-text font-medium mb-4">Расчет количества</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={withdrawForm.resource}
                onChange={(e) => setWithdrawForm({...withdrawForm, resource: e.target.value})}
                className="input-field"
              >
                <option value="">Выберите актив</option>
                {resources.map(resource => (
                  <option key={resource.name} value={resource.name}>
                    {resource.name} (${resource.price.toFixed(2)})
                  </option>
                ))}
              </select>
                          <input
                type="number"
                placeholder="Желаемая сумма ₴"
                value={withdrawForm.money}
                onChange={(e) => setWithdrawForm({...withdrawForm, money: e.target.value})}
                className="input-field"
              />
            <button
              onClick={() => handleWithdrawCalculation('amount')}
                className="btn-primary"
              disabled={loading}
              >
                  <Package size={16} className="inline mr-2" />
                Рассчитать количество
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator 