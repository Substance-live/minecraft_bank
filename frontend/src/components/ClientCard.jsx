import { User, DollarSign, Eye, CreditCard } from 'lucide-react'

const ClientCard = ({ client, onViewDeposits, onViewCredits }) => {
  return (
    <div className="client-card rounded-lg p-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-blue-400" />
          <h3 className="font-bold text-white">{client.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign size={16} className="text-minecraft-green" />
          <button
            onClick={() => onViewDeposits(client.name)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Просмотреть вклады"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onViewCredits(client.name)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Просмотреть кредиты"
          >
            <CreditCard size={16} />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Баланс:</span>
          <span className="text-minecraft-green font-bold text-lg">
            ${client.balance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ClientCard 