import { TrendingUp, Package, BarChart3 } from 'lucide-react'

const ResourceCard = ({ resource, onViewHistory }) => {
  return (
    <div
      className="resource-card rounded-lg p-4 cursor-pointer fade-in"
      onClick={() => onViewHistory(resource.name)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package size={20} className="text-minecraft-green" />
          <h3 className="font-bold text-white">{resource.name}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <BarChart3 
            size={14} 
            className="text-gray-400" 
          />
          <TrendingUp 
            size={16} 
            className="text-gray-400" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Цена:</span>
          <span className="text-minecraft-green font-bold">
            ${resource.price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Количество:</span>
          <span className="text-white font-semibold">
            {resource.amount.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          Нажмите для просмотра графика цен
        </p>
      </div>
    </div>
  )
}

export default ResourceCard 