import { User, DollarSign, Eye, CreditCard } from 'lucide-react'

const ClientCard = ({ client, onViewDeposits, onViewCredits }) => {
  return (
    <div className="stat-card hover:border-primary/50 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text">{client.name}</h3>
            <p className="text-text-secondary text-sm">Активный трейдер</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onViewDeposits(client.name)}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            title="Просмотреть вклады"
          >
            <DollarSign size={18} className="text-success" />
          </button>
          <button
            onClick={() => onViewCredits(client.name)}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            title="Просмотреть кредиты"
          >
            <CreditCard size={18} className="text-warning" />
          </button>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-medium">Баланс</span>
          <div className="flex items-center space-x-2">
            <DollarSign size={16} className="text-primary" />
            <span className="text-text font-semibold text-lg">
              {client.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCard 