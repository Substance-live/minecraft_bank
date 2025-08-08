import { useState, useEffect } from 'react'
import { publicAPI, adminAPI } from '../services/api'
import { X, DollarSign, Calendar, Percent, AlertCircle, RotateCcw } from 'lucide-react'

const ClientCreditsModal = ({ clientName, isOpen, onClose }) => {
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && clientName) {
      fetchCredits()
    }
  }, [isOpen, clientName])

  const fetchCredits = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await publicAPI.getClientCredits(clientName)
      setCredits(response.data.credits || [])
    } catch (err) {
      setError('Ошибка загрузки кредитов')
      console.error('Error fetching credits:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    // Добавляем 3 часа для корректного отображения московского времени
    date.setHours(date.getHours() + 3)
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-400' : 'text-red-400'
  }

  const getStatusText = (isActive) => {
    return isActive ? 'Активный' : 'Просрочен'
  }

  const handleEarlyRepay = async (creditId) => {
    if (!confirm('Вы уверены, что хотите досрочно погасить этот кредит? Проценты будут рассчитаны пропорционально времени.')) {
      return
    }

    try {
      setLoading(true)
      await adminAPI.earlyRepayCredit(creditId)
      // Обновляем список кредитов
      await fetchCredits()
    } catch (err) {
      setError('Ошибка при досрочном погашении кредита')
      console.error('Error early repaying credit:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <DollarSign size={24} className="text-red-400" />
            <h2 className="text-xl font-bold text-white">
              Кредиты клиента {clientName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minecraft-green mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка кредитов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchCredits}
                className="btn-primary"
              >
                Попробовать снова
              </button>
            </div>
          ) : credits.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">У клиента нет активных кредитов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credits.map((credit, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-white font-medium">
                        Кредит #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getStatusColor(credit.is_active)}`}>
                        {getStatusText(credit.is_active)}
                      </span>
                      {credit.is_active && (
                        <button
                          onClick={() => handleEarlyRepay(credit.id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Досрочное погашение"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Сумма:</span>
                      <span className="text-red-400 font-bold ml-2">
                        ₴{credit.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ставка:</span>
                      <span className="text-red-400 font-medium ml-2">
                        {credit.interest_rate?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Срок:</span>
                      <span className="text-white ml-2">
                        {credit.days || 0} дней
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Проценты:</span>
                      <span className="text-red-400 font-medium ml-2">
                        ₴{credit.interest_owed?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                    <div>Создан: {formatDate(credit.created_at)}</div>
                    <div>Погашение: {formatDate(credit.due_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Всего кредитов: {credits.length}
            </div>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCreditsModal 