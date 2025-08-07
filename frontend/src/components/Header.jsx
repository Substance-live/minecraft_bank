import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Shield, Home, Settings } from 'lucide-react'

const Header = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-minecraft-green rounded flex items-center justify-center">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-bold text-white minecraft-text">
                Minecraft Bank
              </h1>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span>Главная</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Settings size={20} />
                  <span>Админ панель</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Выйти</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex items-center space-x-2 btn-primary"
              >
                <Shield size={20} />
                <span>Войти</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 