import { User, DollarSign } from 'lucide-react'

const ClientCard = ({ client }) => {
  return (
    <div className="client-card rounded-lg p-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-blue-400" />
          <h3 className="font-bold text-white">{client.name}</h3>
        </div>
        <DollarSign size={16} className="text-minecraft-green" />
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