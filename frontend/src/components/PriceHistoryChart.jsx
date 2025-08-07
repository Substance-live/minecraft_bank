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
import { X, BarChart3 } from 'lucide-react'

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface border border-border rounded-lg max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text mb-2">История цен</h3>
            <p className="text-text-secondary">История цен для актива {resourceName} пока пуста</p>
          </div>
          <div className="border-t border-border p-4 flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
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
        borderColor: '#2563eb', // primary
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
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
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // background
        titleColor: '#f8fafc', // text
        bodyColor: '#2563eb', // primary
        borderColor: '#334155', // border
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
          color: 'rgba(51, 65, 85, 0.1)' // border/10
        },
        ticks: {
          color: '#94a3b8', // text-secondary
          maxRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.1)' // border/10
        },
        ticks: {
          color: '#94a3b8', // text-secondary
          callback: function(value) {
            return '$' + value.toFixed(2)
          },
          font: {
            size: 11
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
      <div className="bg-surface border border-border rounded-lg max-w-4xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">История цен</h3>
                <p className="text-text-secondary text-sm">{resourceName}</p>
              </div>
            </div>
          <button
            onClick={onClose}
              className="text-text-secondary hover:text-text transition-colors"
          >
              <X size={20} />
          </button>
        </div>

        {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <span className="stat-title">Текущая цена</span>
              <span className="stat-value">${currentPrice.toFixed(2)}</span>
              <span className={`text-sm font-medium mt-1 ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-title">Минимум</span>
              <span className="stat-value">${minPrice.toFixed(2)}</span>
          </div>

            <div className="stat-card">
              <span className="stat-title">Максимум</span>
              <span className="stat-value">${maxPrice.toFixed(2)}</span>
          </div>

            <div className="stat-card">
              <span className="stat-title">Среднее</span>
              <span className="stat-value">${avgPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* График */}
          <div className="h-[400px] bg-background rounded-lg border border-border p-4">
            <Line data={chartData} options={options} />
        </div>

        {/* Информация */}
          <div className="mt-4 text-center">
            <p className="text-text-secondary text-sm">
              Нажмите на точки графика для просмотра деталей
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceHistoryChart 