import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const PriceHistoryChart = ({ resourceName, history, onClose }) => {
  if (!history || history.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">История цен</h3>
            <p className="text-gray-300 mb-4">История цен для {resourceName} пока пуста</p>
            <button
              onClick={onClose}
              className="bg-minecraft-green hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Подготавливаем данные для графика (в обратном порядке, чтобы последняя цена была справа)
  const reversedHistory = [...history].reverse()
  const chartData = {
    labels: reversedHistory.map(item => {
      const date = new Date(item.timestamp)
      // Добавляем 3 часа для корректного отображения московского времени
      date.setHours(date.getHours() + 3)
      return date.toLocaleString('ru-RU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }),
    datasets: [
      {
        label: `Цена ${resourceName}`,
        data: reversedHistory.map(item => item.price),
        borderColor: '#4ade80', // minecraft-green
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `История цен: ${resourceName}`,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#4ade80',
        borderColor: '#4ade80',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Цена: $${context.parsed.y.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#9ca3af',
          maxRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            return '$' + value.toFixed(2)
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  // Вычисляем статистику (используем оригинальный порядок для статистики)
  const prices = history.map(item => item.price)
  const currentPrice = prices[prices.length - 1] // последняя цена в оригинальном порядке
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const priceChange = prices.length > 1 ? currentPrice - prices[prices.length - 2] : 0
  const priceChangePercent = prices.length > 1 ? ((priceChange / prices[prices.length - 2]) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">История цен: {resourceName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 border-b border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-400">Текущая цена</div>
            <div className="text-lg font-bold text-minecraft-green">${currentPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Изменение</div>
            <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Максимум</div>
            <div className="text-lg font-bold text-blue-400">${maxPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Минимум</div>
            <div className="text-lg font-bold text-red-400">${minPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Средняя</div>
            <div className="text-lg font-bold text-yellow-400">${avgPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* График */}
        <div className="p-6">
          <div className="h-80">
            <Line data={chartData} options={options} />
          </div>
        </div>

        {/* Информация */}
        <div className="p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400 text-center">
            Показаны последние {history.length} изменений цены
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceHistoryChart 