import { TrendingUp, Package, BarChart3 } from 'lucide-react'

const ResourceCard = ({ resource, onViewHistory }) => {
  return (
    <div
      className="stat-card cursor-pointer hover:border-primary/50 transition-all duration-200"
      onClick={() => onViewHistory(resource.name)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text">{resource.name}</h3>
            <p className="text-text-secondary text-sm">Торгуемый актив</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-success/10 rounded-full">
            <TrendingUp size={18} className="text-success" />
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <BarChart3 size={18} className="text-primary" />
        </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <span className="text-text-secondary text-sm font-medium">Цена</span>
          <div className="flex items-center space-x-1 mt-1">
                        <span className="text-text font-semibold text-lg">
              ₴{resource.price.toFixed(2)}
            </span>
            <span className="text-success text-sm">+2.4%</span>
          </div>
        </div>
        
        <div>
          <span className="text-text-secondary text-sm font-medium">Объем</span>
          <div className="flex items-center space-x-1 mt-1">
            <span className="text-text font-semibold text-lg">
            {resource.amount.toLocaleString()}
          </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <button className="btn-secondary text-sm">
          Открыть график
        </button>
      </div>
    </div>
  )
}

export default ResourceCard 