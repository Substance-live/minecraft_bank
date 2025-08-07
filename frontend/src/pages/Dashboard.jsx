import { useState, useEffect } from 'react'
import { publicAPI } from '../services/api'
import ResourceCard from '../components/ResourceCard'
import ClientCard from '../components/ClientCard'
import PriceHistoryChart from '../components/PriceHistoryChart'
import Calculator from '../components/Calculator'
import ClientDepositsModal from '../components/ClientDepositsModal'
import ClientCreditsModal from '../components/ClientCreditsModal'
import { RefreshCw, Users, Package } from 'lucide-react'

const Dashboard = () => {
  const [resources, setResources] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResource, setSelectedResource] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [showHistoryChart, setShowHistoryChart] = useState(false)
  const [showDepositsModal, setShowDepositsModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [selectedClientForCredits, setSelectedClientForCredits] = useState(null)


  const fetchData = async () => {
    try {
      setLoading(true)
      const [resourcesRes, clientsRes] = await Promise.all([
        publicAPI.getResourcePrices(),
        publicAPI.getClientBalances()
      ])
      setResources(resourcesRes.data.resources)
      setClients(clientsRes.data.clients)
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async (resourceName) => {
    try {
      const response = await publicAPI.getResourceHistory(resourceName)
      setPriceHistory(response.data.history)
      setSelectedResource(resourceName)
      setShowHistoryChart(true)
    } catch (err) {
      console.error('Error fetching price history:', err)
    }
  }

  const handleViewDeposits = (clientName) => {
    setSelectedClient(clientName)
    setShowDepositsModal(true)
  }

  const handleViewCredits = (clientName) => {
    setSelectedClientForCredits(clientName)
    setShowCreditsModal(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-minecraft-green" size={48} />
          <p className="text-gray-400">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchData} className="btn-primary">
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white minecraft-text mb-2">
          Minecraft Bank
        </h1>
        <p className="text-gray-400">
          Управление ресурсами и счетами игроков
        </p>
      </div>

      {/* Информация о комиссиях */}
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-4">
            Комиссии и условия
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="font-medium text-gray-300 mb-1">Депозит</div>
              <div className="text-sm text-gray-400">Комиссия 5%</div>
              <div className="text-xs text-gray-500 mt-1">Списание с полученной суммы</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="font-medium text-gray-300 mb-1">Снятие</div>
              <div className="text-sm text-gray-400">Комиссия 0%</div>
              <div className="text-xs text-gray-500 mt-1">Без дополнительных списаний</div>
            </div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Логика ценообразования</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• Депозит: фиксированная цена на момент сделки</div>
              <div>• Снятие: поэтапная цена (большие объемы дороже)</div>
              <div>• Курс: отображает текущую рыночную цену</div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка обновления */}
      <div className="flex justify-center">
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 btn-secondary"
        >
          <RefreshCw size={20} />
          <span>Обновить данные</span>
        </button>
      </div>

      {/* Таблица клиентов */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Users size={24} className="text-blue-400" />
          <h2 className="text-xl font-bold text-white">Счета клиентов</h2>
        </div>
        
        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <ClientCard 
                key={client.name} 
                client={client} 
                onViewDeposits={handleViewDeposits}
                onViewCredits={handleViewCredits}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Клиенты не найдены
          </p>
        )}
      </div>

      {/* Таблица ресурсов */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Package size={24} className="text-minecraft-green" />
          <h2 className="text-xl font-bold text-white">Курс ресурсов</h2>
        </div>
        
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.name}
                resource={resource}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Ресурсы не найдены
          </p>
        )}
      </div>

      {/* Калькуляторы */}
      <Calculator />

      {/* График истории цен */}
      {showHistoryChart && (
        <PriceHistoryChart
          resourceName={selectedResource}
          history={priceHistory}
          onClose={() => setShowHistoryChart(false)}
        />
      )}

      {/* Модальное окно вкладов клиента */}
      <ClientDepositsModal
        clientName={selectedClient}
        isOpen={showDepositsModal}
        onClose={() => setShowDepositsModal(false)}
      />

      {/* Модальное окно кредитов клиента */}
      <ClientCreditsModal
        clientName={selectedClientForCredits}
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />

    </div>
  )
}

export default Dashboard 